/* ============================================================ */
/* EVENTLIVE - views-attendee.js                                */
/* Vistas del ASISTENTE. Todo conectado al store y reflejado    */
/* entre vistas. US: 06,07,08,09 (mapa), 28,29,30,31,32,33.     */
/* ============================================================ */

Views = (typeof Views === "undefined") ? {} : Views;

// Al entrar al mapa como asistente, evalua la alerta de proximidad
const _origMapa = Views.mapa;
Views.mapa = function (shell) {
  _origMapa(shell);
  if (EL.store.session.role === "asistente") maybeProximityAlert();
};

/* ---------- US28: ONBOARDING de intereses (3 a 8) ---------- */
Views.onboardInterests = function () {
  const cats = ["Música", "Arte", "Gastronomía", "Gaming", "Deporte", "K-pop", "Teatro", "Cine"];
  const sel = new Set(EL.store.userInterests);
  const body = document.getElementById("onboardBody");
  const render = () => {
    body.innerHTML = `
      <h2 id="onboardTitle">¿Qué te gusta?</h2>
      <p class="onboard-sub">Elige entre 3 y 8 intereses. Usaremos esto para filtrar tu mapa y recomendarte planes.</p>
      <div class="chips onboard-chips">
        ${cats.map(c => `<button type="button" class="chip ${sel.has(c) ? "active" : ""}" aria-pressed="${sel.has(c)}" onclick="Views._onbToggle('${c}')">${c}</button>`).join("")}
      </div>
      <p class="onboard-count">${sel.size} seleccionado${sel.size !== 1 ? "s" : ""} ${sel.size < 3 ? "· elige al menos 3" : sel.size > 8 ? "· máximo 8" : "· ¡perfecto!"}</p>
      <div class="onboard-actions">
        <button class="btn btn-outline" onclick="EL.skipOnboarding()">Omitir por ahora</button>
        <button class="btn btn-primary" ${sel.size < 3 || sel.size > 8 ? "disabled" : ""} onclick="Views._onbSave()">Continuar</button>
      </div>`;
  };
  Views._onbSel = sel; Views._onbRender = render;
  render();
  EL.openModal("onboardModal");
};
Views._onbToggle = function (c) {
  const s = Views._onbSel;
  if (s.has(c)) s.delete(c); else if (s.size < 8) s.add(c); else { EL.toast("Máximo 8 intereses"); return; }
  Views._onbRender();
};
Views._onbSave = function () {
  EL.store.userInterests = [...Views._onbSel];
  _interestPrefilled = false; // forzar re-prefiltro del mapa
  EL.closeModal("onboardModal");
  EL.toast("Intereses guardados. Tu mapa quedó personalizado.");
  Views.mapa(document.getElementById("appShell"));
};
EL.skipOnboarding = function () { EL.closeModal("onboardModal"); };

/* ---------- US29 FAVORITOS ---------- */
Views.favoritos = function (shell) {
  const favs = EL.store.favorites.map(id => EL.store.getEvent(id)).filter(Boolean);
  shell.innerHTML = `
    <div class="view-head"><h2>Tus favoritos</h2><p>Eventos que guardaste para no perderlos.</p></div>
    <div class="panel">
      <div class="panel-title">Guardados (${favs.length})</div>
      <div id="favList" style="margin-top:14px;"></div>
    </div>
    <div class="panel">
      <div class="panel-sub">¿Buscas ideas nuevas? Mira lo que te recomendamos.</div>
      <button class="btn btn-outline btn-sm" onclick="EL.go('para-ti')">${ICON.target} Ver "Para ti"</button>
    </div>`;
  const favEl = document.getElementById("favList");
  if (favs.length === 0) {
    favEl.innerHTML = `<div class="empty">${ICON.heartline}<h4>Aún no tienes favoritos</h4><p>Abre un evento en el mapa y toca el corazón para guardarlo.</p></div>`;
  } else {
    favEl.innerHTML = favs.map(ev => `
      <div class="list-row">
        <div class="info"><b>${ev.name}</b><p>${ev.category} · ${ev.address} · ${ev.time}</p></div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-outline btn-sm" onclick="EL.openEvent(${ev.id})">Ver</button>
          <button class="btn btn-sm btn-icon danger-ic" aria-label="Quitar ${ev.name} de favoritos" onclick="Views._removeFav(${ev.id})">${ICON.trash}</button>
        </div>
      </div>`).join("");
  }
  EL.closeBurger(); window.scrollTo(0, 0);
};
// quitar favorito con opcion de DESHACER (mejor que confirmar para 1 ítem)
Views._removeFav = function (id) {
  EL.store.toggleFavorite(id);
  Views.favoritos(document.getElementById("appShell"));
  const stack = document.getElementById("toastStack");
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `${ICON.trash}<span>Quitado de favoritos</span><button class="toast-undo" id="undoFav">Deshacer</button>`;
  stack.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  document.getElementById("undoFav").onclick = () => { EL.store.toggleFavorite(id); Views.favoritos(document.getElementById("appShell")); t.remove(); EL.toast("Favorito restaurado"); };
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 4200);
};

/* ---------- US30 RECOMENDACIONES "Para ti" ---------- */
// Basadas en historial de asistencia (categorias asistidas) y favoritos,
// con explicacion por item y entre 5 y 10 resultados.
function recommend() {
  const attended = EL.store.getAttendedEvents();
  const favCats = EL.store.favorites.map(id => (EL.store.getEvent(id) || {}).category).filter(Boolean);
  const attCats = attended.map(e => e.category);
  const liked = new Set([...attCats, ...favCats, ...EL.store.userInterests]);

  const pool = EL.store.activeEvents().filter(e => !EL.store.isFavorite(e.id) && !EL.store.hasAttended(e.id));
  const scored = pool.map(e => {
    let reason = "", score = 0;
    const sameAsAttended = attended.find(a => a.category === e.category && a.id !== e.id);
    if (sameAsAttended) { score += 3; reason = `Porque asististe a "${sameAsAttended.name}"`; }
    else if (favCats.includes(e.category)) { score += 2; reason = "Similar a tus favoritos"; }
    else if (EL.store.userInterests.includes(e.category)) { score += 1; reason = `Por tu interés en ${e.category}`; }
    if (liked.has(e.category)) score += 1;
    return { ev: e, reason: reason || `Popular en ${e.category}`, score };
  }).sort((a, b) => b.score - a.score);

  return scored.slice(0, Math.min(10, Math.max(5, scored.length)));
}

Views.paraTi = function (shell) {
  const recos = recommend();
  const hasHistory = EL.store.attendedEvents.length > 0;
  shell.innerHTML = `
    <div class="view-head"><h2>Para ti</h2><p>Recomendaciones basadas en tu historial, favoritos e intereses.</p></div>
    <div class="panel">
      ${hasHistory ? "" : `<div class="panel-sub">Asiste a eventos (validados por GPS) o marca favoritos para afinar tus recomendaciones.</div>`}
      <div class="reco-grid" id="recoList"></div>
    </div>`;
  const el = document.getElementById("recoList");
  el.innerHTML = recos.length
    ? recos.map(r => {
        r.ev._dist = null;
        return `<div class="reco-card">
          <div class="reco-reason">${ICON.trend} ${r.reason}</div>
          ${_eventCardHTML(r.ev)}
        </div>`;
      }).join("")
    : `<p style="color:var(--t-on-light-dim);font-size:14px;">Configura tus intereses en tu perfil para ver recomendaciones.</p>`;
  EL.closeBurger(); window.scrollTo(0, 0);
};

/* ---------- US31 COMUNIDADES ---------- */
Views.comunidades = function (shell) {
  shell.innerHTML = `
    <div class="view-head"><h2>Comunidades</h2><p>Conecta con personas que comparten tus intereses.</p></div>
    <div class="panel"><div id="commList"></div></div>`;
  renderCommList();
  EL.closeBurger(); window.scrollTo(0, 0);
};
function renderCommList() {
  const el = document.getElementById("commList");
  if (!el) return;
  el.innerHTML = EL.store.communities.map(co => {
    const joined = EL.store.isJoined(co.id);
    const feed = joined ? EL.store.communityEvents(co.id) : [];
    return `
      <div class="comm-card">
        <div class="list-row" style="border:0;padding:0;">
          <div class="info"><b>${co.name}</b><p>${co.category} · ${co.members.toLocaleString("es-PE")} miembros</p></div>
          <button class="btn btn-sm ${joined ? "btn-outline" : "btn-primary"}" onclick="Views._toggleComm(${co.id})">${joined ? "Salir" : "Unirme"}</button>
        </div>
        ${joined ? `
          <div class="comm-feed">
            <div class="comm-feed-h">${ICON.ticket} Eventos exclusivos de la comunidad</div>
            ${feed.length ? feed.map(ev => `<button class="comm-feed-item" onclick="EL.openEvent(${ev.id})">${ev.name} · ${ev.time}</button>`).join("") : `<span class="comm-feed-empty">Aún no hay eventos exclusivos.</span>`}
          </div>` : ""}
      </div>`;
  }).join("");
}
Views._toggleComm = function (id) {
  const co = EL.store.communities.find(c => c.id === id);
  if (EL.store.isJoined(id)) {
    // US31: confirmacion al salir
    EL.confirm(`¿Salir de "${co.name}"? Dejarás de ver su feed exclusivo (tu historial se conserva).`, () => {
      EL.store.toggleCommunity(id); EL.toast("Saliste de la comunidad"); renderCommList();
    }, { title: "Salir de la comunidad", okText: "Salir", danger: true });
  } else {
    EL.store.toggleCommunity(id);
    renderCommList();
    // US31: notificacion de bienvenida con las normas
    const rules = EL.store.communityRules[id] || "Respeta a la comunidad.";
    const n = EL.store.addNotification({ icon: ICON.users, title: `Bienvenido a ${co.name}`, body: `Normas: ${rules}`, view: "comunidades" });
    EL.renderNotifBell();
    EL.toast("Te uniste. Revisa las normas en notificaciones.");
  }
};

/* ---------- MI PERFIL ---------- */
Views.perfil = function (shell) {
  const u = EL.store.session.user;
  const joined = EL.store.joinedCommunities.map(id => EL.store.communities.find(c => c.id === id)).filter(Boolean);
  const following = EL.store.followedOrganizers;
  const reviews = EL.store.myReviews;
  const favCount = EL.store.favorites.length;

  shell.innerHTML = `
    <div class="view-head"><h2>Mi perfil</h2><p>Tu actividad en EventLive.</p></div>

    <div class="panel">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
        <div class="avatar-lg" aria-hidden="true">${u.name.charAt(0).toUpperCase()}</div>
        <div style="flex:1;min-width:160px;"><b style="font-size:18px;color:var(--t-on-light)">${u.name}</b><p style="color:var(--t-on-light-dim);font-size:14px;">${u.email}</p></div>
        ${EL.store.session.canOrganize
          ? `<button class="btn btn-outline btn-sm" onclick="EL.switchRole('organizador')">${ICON.swap} Ir a modo Organizador</button>`
          : `<button class="btn btn-outline btn-sm" onclick="EL.becomeOrganizer()">${ICON.chart} Convertirme en organizador</button>`}
      </div>
      <div class="stat-tiles" style="margin-top:18px;">
        <div class="tile"><div class="v brand">${favCount}</div><div class="k">Favoritos</div></div>
        <div class="tile"><div class="v brand">${joined.length}</div><div class="k">Comunidades</div></div>
        <div class="tile"><div class="v brand">${following.length}</div><div class="k">Siguiendo</div></div>
        <div class="tile"><div class="v brand">${reviews.length}</div><div class="k">Reseñas</div></div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-title">Tus intereses</div>
      <div class="panel-sub">Elige entre 3 y 8 para personalizar tu mapa y recomendaciones.</div>
      <div class="chips" id="interestChips"></div>
      <p id="interestCount" class="field-hint" style="margin-top:8px;"></p>
    </div>

    <div class="panel">
      <div class="panel-title">Mis comunidades</div>
      <div id="myComms" style="margin-top:12px;"></div>
    </div>

    <div class="panel">
      <div class="panel-title">Organizadores que sigues</div>
      <div id="myFollowing" style="margin-top:12px;"></div>
    </div>

    <div class="panel">
      <div class="panel-title">Tus reseñas</div>
      <div id="myReviews" style="margin-top:12px;"></div>
    </div>

    <div class="panel">
      <div class="panel-title">Descubre organizadores</div>
      <div id="discoverOrgs" style="margin-top:12px;"></div>
    </div>`;

  renderInterests();
  renderMyComms();
  renderFollowing();
  renderMyReviews();
  renderDiscoverOrgs();
  EL.closeBurger(); window.scrollTo(0, 0);
};

function renderInterests() {
  const cats = ["Música", "Arte", "Gastronomía", "Gaming", "Deporte", "K-pop", "Teatro", "Cine"];
  const el = document.getElementById("interestChips");
  el.innerHTML = cats.map(c => {
    const on = EL.store.userInterests.includes(c);
    return `<button class="chip ${on ? "active" : ""}" aria-pressed="${on}" onclick="Views._toggleInterest('${c}')">${c}</button>`;
  }).join("");
  const n = EL.store.userInterests.length;
  const cnt = document.getElementById("interestCount");
  if (cnt) cnt.textContent = n < 3 ? `${n}/3 mínimo — elige al menos 3` : `${n} intereses activos`;
}
Views._toggleInterest = function (c) {
  const arr = EL.store.userInterests; const i = arr.indexOf(c);
  if (i >= 0) arr.splice(i, 1);
  else if (arr.length < 8) arr.push(c);
  else { EL.toast("Máximo 8 intereses"); return; }
  _interestPrefilled = false;
  renderInterests();
};

function renderMyComms() {
  const el = document.getElementById("myComms");
  const joined = EL.store.joinedCommunities.map(id => EL.store.communities.find(c => c.id === id)).filter(Boolean);
  el.innerHTML = joined.length
    ? joined.map(co => `<div class="list-row"><div class="info"><b>${co.name}</b><p>${co.members.toLocaleString("es-PE")} miembros</p></div><button class="btn btn-outline btn-sm" onclick="Views._leaveFromProfile(${co.id})">Salir</button></div>`).join("")
    : `<div class="empty" style="padding:24px;">${ICON.users}<h4>No perteneces a ninguna comunidad</h4><p>Únete desde la sección Comunidades.</p></div>`;
}
Views._leaveFromProfile = function (id) {
  const co = EL.store.communities.find(c => c.id === id);
  EL.confirm(`¿Salir de "${co.name}"?`, () => { EL.store.toggleCommunity(id); EL.toast("Saliste de la comunidad"); Views.perfil(document.getElementById("appShell")); }, { title: "Salir de la comunidad", okText: "Salir", danger: true });
};

function renderFollowing() {
  const el = document.getElementById("myFollowing");
  const f = EL.store.followedOrganizers;
  el.innerHTML = f.length
    ? f.map(name => `<div class="list-row"><div class="info"><b>${name}</b></div><button class="btn btn-outline btn-sm" onclick="Views._unfollow('${name.replace(/'/g, "")}')">Dejar de seguir</button></div>`).join("")
    : `<div class="empty" style="padding:24px;">${ICON.bell}<h4>No sigues a ningún organizador</h4><p>Síguelos desde un evento o desde la lista de abajo.</p></div>`;
}
Views._unfollow = function (name) { EL.store.toggleFollow(name); EL.toast("Dejaste de seguir"); Views.perfil(document.getElementById("appShell")); };

function renderMyReviews() {
  const el = document.getElementById("myReviews");
  const r = EL.store.myReviews;
  el.innerHTML = r.length
    ? r.map(rv => {
        let stars = ""; for (let i = 1; i <= 5; i++) stars += `<span style="color:var(--lime)" aria-hidden="true">${i <= rv.rating ? "★" : "☆"}</span>`;
        return `<div class="list-row"><div class="info"><b>${rv.eventName}</b><p><span aria-label="${rv.rating} de 5">${stars}</span> · ${rv.date}</p>${rv.text ? `<p style="margin-top:4px;font-style:italic;">"${rv.text}"</p>` : ""}</div></div>`;
      }).join("")
    : `<div class="empty" style="padding:24px;">${ICON.starline}<h4>Aún no has reseñado eventos</h4><p>Reseña un evento al que asististe desde su ficha.</p></div>`;
}

function renderDiscoverOrgs() {
  const el = document.getElementById("discoverOrgs");
  el.innerHTML = EL.store.organizers.map(o => {
    const f = EL.store.isFollowing(o.name);
    return `<div class="list-row">
      <div class="info"><b>${o.name}</b><p>${o.category} · ${o.events} eventos</p></div>
      <button class="btn btn-sm ${f ? "btn-outline" : "btn-primary"}" onclick="Views._toggleFollow('${o.name.replace(/'/g, "")}')">${f ? "Siguiendo" : "Seguir"}</button>
    </div>`;
  }).join("");
}
Views._toggleFollow = function (name) { const f = EL.store.toggleFollow(name); EL.toast(f ? "Ahora sigues a " + name : "Dejaste de seguir"); renderFollowing(); renderDiscoverOrgs(); };

/* ---------- US32: dejar resena (estrellas reales + asistencia) ---------- */
function openReviewModal(eventId, label) {
  const existing = EL.store.getReview(eventId);
  let rating = existing ? existing.rating : 0;
  const body = document.getElementById("eventModalBody");
  document.getElementById("eventModalTitle").textContent = "Reseñar evento";
  const render = () => {
    let stars = "";
    for (let i = 1; i <= 5; i++) stars += `<button type="button" onclick="window._setStar(${i})" aria-label="${i} estrella${i > 1 ? "s" : ""}" aria-pressed="${i <= rating}" style="font-size:30px;color:var(--lime);background:none;line-height:1;">${i <= rating ? "★" : "☆"}</button>`;
    body.innerHTML = `
      <div class="modal-pad">
        <h2 style="font-size:20px;margin-bottom:4px;color:var(--t-on-light)">Reseñar</h2>
        <p style="color:var(--t-on-light-dim);font-size:14px;margin-bottom:8px;">${label}</p>
        <p class="pill pill-ok" style="margin-bottom:14px;">${ICON.shield} Asistencia verificada por GPS</p>
        <div role="group" aria-label="Calificación de 1 a 5 estrellas" style="margin-bottom:12px;">${stars}</div>
        <div class="field"><label for="revText">Comentario (opcional, máx. 280)</label><textarea id="revText" rows="3" maxlength="280" placeholder="Cuéntanos tu experiencia">${existing ? existing.text : ""}</textarea></div>
        <button class="btn btn-primary btn-block" onclick="window._saveReview(${eventId})">Publicar reseña</button>
      </div>`;
  };
  window._setStar = (n) => { rating = n; render(); };
  window._saveReview = (id) => {
    if (rating === 0) { EL.toast("Elige una calificación primero"); return; }
    const txt = document.getElementById("revText").value.trim().slice(0, 280);
    EL.store.addReview(id, rating, txt);
    EL.closeEvent();
    EL.toast("Reseña publicada");
    if (EL.currentView === "perfil") Views.perfil(document.getElementById("appShell"));
  };
  render();
  EL.openModal("eventModal");
}
