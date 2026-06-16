/* ============================================================ */
/* EVENTLIVE - views-organizer.js                               */
/* Vistas del ORGANIZADOR. Funciones reales conectadas al store.*/
/* US: 11,12,13,14,16,17,18,19 (publicar/gestionar),            */
/* 20,22,23,24,25,26,27 (inteligencia), 15,38 (destacar/promo). */
/* ============================================================ */

Views = (typeof Views === "undefined") ? {} : Views;

const CATEGORIES = ["Música", "Arte", "Gastronomía", "Gaming", "Deporte", "K-pop", "Teatro", "Cine"];
const TAG_SUGGESTIONS = ["En vivo", "Gratis", "Aire libre", "Familiar", "Nocturno", "Indie", "Food trucks", "Networking", "Acústico", "Underground"];
const MAX_TAGS = 3; // US19: máximo 3 etiquetas por evento

/* Helper: imprimir/descargar como PDF mediante iframe oculto (US20/US24) */
function _printHTML(title, innerHTML) {
  const f = document.createElement("iframe");
  f.setAttribute("aria-hidden", "true");
  f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(f);
  const doc = f.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${title}</title>
    <style>
      *{box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;}
      body{margin:32px;color:#0f2330;}
      h1{font-size:22px;margin:0 0 4px;} .sub{color:#5a7388;font-size:13px;margin:0 0 18px;}
      .brand{color:#0E9DB0;font-weight:bold;} hr{border:0;border-top:1px solid #dde6ec;margin:16px 0;}
      table{width:100%;border-collapse:collapse;margin:8px 0 18px;} td,th{border:1px solid #dde6ec;padding:8px 10px;text-align:left;font-size:13px;}
      th{background:#f1f6f8;} .tiles{display:flex;gap:12px;flex-wrap:wrap;margin:8px 0 18px;}
      .tile{border:1px solid #dde6ec;border-radius:8px;padding:12px 16px;min-width:120px;} .tile b{font-size:20px;color:#0E9DB0;} .tile span{display:block;font-size:11px;color:#5a7388;}
      .cmt{border-left:3px solid #A6E22E;background:#f7fbef;padding:8px 12px;margin:8px 0;border-radius:4px;font-size:13px;} .cmt b{color:#0f2330;}
      .foot{color:#9bb0bd;font-size:11px;margin-top:24px;}
    </style></head><body>${innerHTML}
    <p class="foot">EventLive · VibeSpot — Reporte generado el ${new Date().toLocaleString("es-PE")}. Documento de demo académica.</p>
    </body></html>`);
  doc.close();
  const fire = () => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) {} setTimeout(() => f.remove(), 1500); };
  f.onload = fire;
  setTimeout(fire, 400);
}

/* ---------- PUBLICAR (US11, US18, US19) con prevencion de errores ---------- */
Views.publicar = function (shell) {
  const dup = Views._duplicateData; // US17: prellenado al duplicar
  shell.innerHTML = `
    <div class="view-head"><h2>${dup ? "Duplicar evento" : "Publicar un evento"}</h2><p>Crea tu evento en menos de un minuto. Los campos con * son obligatorios.</p></div>
    ${dup ? `<div class="interest-note" style="max-width:620px;"><span>${ICON.copy} Datos copiados de "${dup.name}". Ajusta lo que necesites y publica.</span></div>` : ""}
    <div class="panel" style="max-width:620px;">
      <form id="pubForm" onsubmit="return Views._publish(event)">
        <div class="field" id="f-name">
          <label for="p-name">Nombre del evento *</label>
          <input type="text" id="p-name" placeholder="Ej. Feria de arte en Barranco" value="${dup ? dup.name.replace(/"/g, "&quot;") : ""}" />
          <div class="err-msg">Ingresa el nombre del evento.</div>
        </div>
        <div class="row-2">
          <div class="field" id="f-cat">
            <label for="p-cat">Categoría *</label>
            <select id="p-cat"><option value="">Selecciona…</option>${CATEGORIES.map(c => `<option ${dup && dup.category === c ? "selected" : ""}>${c}</option>`).join("")}</select>
            <div class="err-msg">Elige una categoría.</div>
          </div>
          <div class="field" id="f-time">
            <label for="p-time">Hora de inicio *</label>
            <input type="time" id="p-time" value="${dup ? dup.time : ""}" />
            <div class="err-msg">Indica la hora.</div>
          </div>
        </div>
        <div class="field suggest-wrap" id="f-addr">
          <label for="p-addr">Ubicación *</label>
          <input type="text" id="p-addr" placeholder="Empieza a escribir una zona de Lima…" autocomplete="off" value="${dup ? dup.address.replace(/"/g, "&quot;") : ""}" oninput="Views._suggestAddr(this.value)" />
          <div class="err-msg">Ingresa la ubicación.</div>
          <div class="suggest-list" id="addrSuggest" style="display:none;"></div>
        </div>
        <div class="row-2">
          <div class="field" id="f-cap">
            <label for="p-cap">Aforo *</label>
            <input type="number" id="p-cap" min="1" placeholder="100" value="${dup ? dup.capacity : ""}" />
            <div class="err-msg">Ingresa un aforo válido.</div>
          </div>
          <div class="field">
            <label for="p-dur">Duración (horas)</label>
            <input type="number" id="p-dur" min="1" max="12" value="${dup ? Math.round(dup.durationMin / 60) : 3}" />
          </div>
        </div>

        <!-- US19: etiquetas que SUGIEREN (máximo 3) -->
        <div class="field">
          <label>Etiquetas (opcional, máx. ${MAX_TAGS})</label>
          <div class="tag-box" id="tagBox" onclick="document.getElementById('tagInput').focus()">
            <input type="text" id="tagInput" placeholder="Escribe y presiona Enter…" autocomplete="off"
              oninput="Views._suggestTag(this.value)" onkeydown="Views._tagKey(event)" />
          </div>
          <div class="suggest-list" id="tagSuggest" style="display:none;position:static;box-shadow:none;border:none;margin-top:8px;"></div>
          <div class="hint">Sugerencias: ${TAG_SUGGESTIONS.slice(0, 5).join(", ")}…</div>
        </div>

        <!-- US18: imagenes (carga real desde el dispositivo) -->
        <div class="field">
          <label>Imágenes del evento (opcional)</label>
          <input type="file" id="p-imgs" accept="image/*" multiple onchange="Views._previewImgs(event)" />
          <div id="imgPreview" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;"></div>
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg">${dup ? "Publicar copia" : "Publicar evento"}</button>
      </form>
    </div>`;
  Views._tags = dup && dup.tags ? dup.tags.slice(0, MAX_TAGS) : [];
  Views._firstImgUrl = dup ? dup.imgUrl : null;
  Views._duplicateData = null; // se consume una sola vez
  setTimeout(() => Views._renderTags(), 0);
  EL.closeBurger(); window.scrollTo(0, 0);
};

// US19 autocompletado de ubicacion
Views._suggestAddr = function (val) {
  const zones = ["Miraflores", "Barranco", "San Isidro", "Surco", "Chorrillos", "Pueblo Libre", "Magdalena del Mar", "San Borja", "Jesús María", "Lince"];
  const box = document.getElementById("addrSuggest");
  if (!val.trim()) { box.style.display = "none"; return; }
  const matches = zones.filter(z => z.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
  if (!matches.length) { box.style.display = "none"; return; }
  box.innerHTML = matches.map(z => `<button type="button" onclick="Views._pickAddr('${z}')">${z}, Lima</button>`).join("");
  box.style.display = "block";
};
Views._pickAddr = function (z) { document.getElementById("p-addr").value = z + ", Lima"; document.getElementById("addrSuggest").style.display = "none"; };

// US19 etiquetas con sugerencia (respeta el máximo)
Views._suggestTag = function (val) {
  const box = document.getElementById("tagSuggest");
  if (!val.trim() || Views._tags.length >= MAX_TAGS) { box.style.display = "none"; return; }
  const matches = TAG_SUGGESTIONS.filter(t => t.toLowerCase().includes(val.toLowerCase()) && !Views._tags.includes(t)).slice(0, 5);
  if (!matches.length) { box.style.display = "none"; return; }
  box.innerHTML = matches.map(t => `<button type="button" onclick="Views._addTag('${t}')">${t}</button>`).join("");
  box.style.display = "block";
};
Views._tagKey = function (e) {
  if (e.key === "Enter") { e.preventDefault(); const v = e.target.value.trim(); if (v) Views._addTag(v); }
};
// US19: bloquea al superar el máximo de 3 con aviso claro
Views._addTag = function (t) {
  if (Views._tags.includes(t)) { document.getElementById("tagInput").value = ""; return; }
  if (Views._tags.length >= MAX_TAGS) {
    EL.toast(`Máximo ${MAX_TAGS} etiquetas. Quita una para agregar otra.`);
    document.getElementById("tagInput").value = "";
    document.getElementById("tagSuggest").style.display = "none";
    return;
  }
  Views._tags.push(t);
  document.getElementById("tagInput").value = "";
  document.getElementById("tagSuggest").style.display = "none";
  Views._renderTags();
};
Views._renderTags = function () {
  const box = document.getElementById("tagBox");
  if (!box) return;
  box.querySelectorAll(".tag").forEach(x => x.remove());
  const input = document.getElementById("tagInput");
  Views._tags.forEach(t => {
    const span = document.createElement("span");
    span.className = "tag";
    span.innerHTML = `${t} <button type="button" aria-label="Quitar etiqueta ${t}" onclick="Views._rmTag('${t}')">✕</button>`;
    box.insertBefore(span, input);
  });
  if (input) input.placeholder = Views._tags.length >= MAX_TAGS ? "Máximo alcanzado" : "Escribe y presiona Enter…";
};
Views._rmTag = function (t) { Views._tags = Views._tags.filter(x => x !== t); Views._renderTags(); };

// US18 preview real de imagenes (guarda la primera para la ficha)
Views._previewImgs = function (e) {
  const prev = document.getElementById("imgPreview");
  prev.innerHTML = "";
  const files = [...e.target.files].slice(0, 5);
  files.forEach((file, i) => {
    const url = URL.createObjectURL(file);
    if (i === 0) Views._firstImgUrl = url; // US18: imagen principal del evento
    const div = document.createElement("div");
    div.style.cssText = "width:84px;height:64px;border-radius:8px;background-size:cover;background-position:center;border:1px solid var(--line);";
    div.style.backgroundImage = `url(${url})`;
    prev.appendChild(div);
  });
  if (files.length) EL.toast(`${files.length} imagen(es) lista(s)`);
};

// US11 publicar con validacion completa (+ imgUrl US18)
Views._publish = function (e) {
  e.preventDefault();
  const f = (id) => document.getElementById(id);
  const fields = [["f-name", "p-name"], ["f-cat", "p-cat"], ["f-time", "p-time"], ["f-addr", "p-addr"], ["f-cap", "p-cap"]];
  let ok = true;
  fields.forEach(([w, i]) => {
    const val = f(i).value.trim();
    const bad = !val || (i === "p-cap" && parseInt(val, 10) < 1);
    f(w).classList.toggle("invalid", bad);
    if (bad) ok = false;
  });
  if (!ok) { EL.toast("Revisa los campos obligatorios"); return false; }

  EL.store.publishEvent({
    name: f("p-name").value.trim(),
    category: f("p-cat").value,
    time: f("p-time").value,
    address: f("p-addr").value.trim(),
    capacity: parseInt(f("p-cap").value, 10),
    durationMin: (parseInt(f("p-dur").value, 10) || 3) * 60,
    lat: USER_POS[0] + (Math.random() - .5) * 0.03,
    lng: USER_POS[1] + (Math.random() - .5) * 0.03,
    tags: Views._tags.slice(),
    imgUrl: Views._firstImgUrl || null,
  });
  Views._firstImgUrl = null;
  EL.toast("Evento publicado. Recuerda validarlo en sitio.");
  EL.go("mis-eventos");
  return false;
};

/* ---------- MIS EVENTOS (US12 validar, US13 editar, US14 cancelar, US16 aforo, US17 duplicar, US15 destacar, US38 visibilidad) ---------- */
Views.misEventos = function (shell) {
  shell.innerHTML = `
    <div class="view-head"><h2>Mis eventos</h2><p>Gestiona tus publicaciones: valida en sitio, ajusta aforo, duplica, promociona o cancela.</p></div>
    <div id="myEvWrap"></div>`;
  renderMyEvents();
  EL.closeBurger(); window.scrollTo(0, 0);
};
function renderMyEvents() {
  const wrap = document.getElementById("myEvWrap");
  const evs = EL.store.getMyEvents();
  if (!evs.length) {
    wrap.innerHTML = `<div class="panel"><div class="empty">${ICON.calendar}<h4>Aún no has publicado eventos</h4><p>Ve a Publicar para crear tu primer evento.</p><button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="EL.go('publicar')">Publicar evento</button></div></div>`;
    return;
  }
  wrap.innerHTML = evs.map(ev => {
    const pct = Math.round((ev.occupied / ev.capacity) * 100);
    const full = ev.occupied >= ev.capacity;
    const thumb = ev.imgUrl ? `background:url(${ev.imgUrl}) center/cover` : `background:${ev.img}`;
    if (ev.cancelled) {
      return `
      <div class="panel" style="opacity:.75;">
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <div class="me-thumb" style="${thumb}"></div>
          <div style="flex:1;min-width:160px;">
            <b style="font-size:16px;color:var(--t-on-light)">${ev.name}</b>
            <p style="font-size:13px;color:var(--t-on-light-dim);margin-top:2px;">${ev.category} · ${ev.address} · ${ev.time}</p>
            <div style="margin-top:8px;"><span class="pill" style="background:rgba(220,59,75,.12);color:var(--err);">Cancelado</span></div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="Views._duplicate(${ev.id})">${ICON.copy} Reusar datos</button>
        </div>
      </div>`;
    }
    return `
    <div class="panel">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;flex-wrap:wrap;">
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div class="me-thumb" style="${thumb}"></div>
          <div>
            <b style="font-size:16px;color:var(--t-on-light)">${ev.name}</b>
            <p style="font-size:13px;color:var(--t-on-light-dim);margin-top:2px;">${ev.category} · ${ev.address} · ${ev.time}</p>
            <div style="margin-top:8px;">${ev.verified ? `<span class="pill pill-ok">${ICON.shield} Verificado</span>` : `<span class="pill pill-warn">Sin verificar</span>`}
              ${ev.featured ? `<span class="pill pill-info" style="margin-left:6px;">${ICON.star} Destacado</span>` : ''}</div>
          </div>
        </div>
      </div>
      <!-- US16 aforo en vivo -->
      <div style="margin-top:14px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--t-on-light);font-weight:600;margin-bottom:6px;">
          <span>Aforo: ${ev.occupied} / ${ev.capacity} ${full ? '<span style="color:var(--err)">· Lleno</span>' : `· ${pct}%`}</span>
        </div>
        <div style="background:var(--paper-3);border-radius:99px;height:8px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:var(--grad-brand);"></div></div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="Views._aforo(${ev.id},10)">+10 asistentes</button>
          <button class="btn btn-outline btn-sm" onclick="Views._aforo(${ev.id},-10)">-10</button>
          ${!ev.verified ? `<button class="btn btn-primary btn-sm" onclick="Views._validate(${ev.id})">${ICON.pin} Validar en sitio</button>` : ''}
          <button class="btn btn-outline btn-sm" onclick="Views._editEvent(${ev.id})">${ICON.edit} Editar</button>
          <button class="btn btn-outline btn-sm" onclick="Views._duplicate(${ev.id})">${ICON.copy} Duplicar</button>
          ${!ev.featured ? `<button class="btn btn-outline btn-sm" onclick="Views._feature(${ev.id})">${ICON.star} Destacar</button>` : ''}
          <button class="btn btn-outline btn-sm" onclick="Views._promote(${ev.id})">${ICON.target} Promocionar 1 km</button>
          <button class="btn btn-sm btn-danger" onclick="Views._cancelEvent(${ev.id})">${ICON.x} Cancelar</button>
        </div>
        <div id="evAction-${ev.id}" style="margin-top:10px;"></div>
      </div>
    </div>`;
  }).join("");
}
// US16
Views._aforo = function (id, d) {
  const ev = EL.store.getEvent(id); if (!ev) return;
  ev.occupied = Math.max(0, Math.min(ev.capacity, ev.occupied + d));
  EL.toast(ev.occupied >= ev.capacity ? "Aforo completo" : "Aforo actualizado");
  renderMyEvents();
};
// US12 validacion geofencing (simulada creible) + marca temporal (US05)
Views._validate = function (id) {
  const box = document.getElementById(`evAction-${id}`);
  box.innerHTML = `<p style="font-size:13px;color:var(--t-on-light-dim)">Comprobando tu ubicación GPS respecto al punto del evento…</p>`;
  setTimeout(() => {
    const ev = EL.store.getEvent(id);
    ev.verified = true;
    ev.verifiedAt = "hoy " + new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    EL.toast("Ubicación validada. Evento verificado");
    renderMyEvents();
  }, 1300);
};
// US13 editar (formulario real inline)
Views._editEvent = function (id) {
  const ev = EL.store.getEvent(id); if (!ev) return;
  const box = document.getElementById(`evAction-${id}`);
  box.innerHTML = `
    <div style="background:var(--paper-2);border-radius:10px;padding:14px;margin-top:6px;">
      <div class="row-2">
        <div class="field" style="margin-bottom:10px;"><label>Nombre</label><input id="ed-name-${id}" value="${ev.name.replace(/"/g, "&quot;")}" /></div>
        <div class="field" style="margin-bottom:10px;"><label>Hora</label><input type="time" id="ed-time-${id}" value="${ev.time}" /></div>
      </div>
      <div class="field" style="margin-bottom:10px;"><label>Aforo</label><input type="number" id="ed-cap-${id}" value="${ev.capacity}" min="1" /></div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" onclick="Views._saveEdit(${id})">Guardar cambios</button>
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('evAction-${id}').innerHTML=''">Cancelar</button>
      </div>
    </div>`;
};
Views._saveEdit = function (id) {
  const ev = EL.store.getEvent(id); if (!ev) return;
  ev.name = document.getElementById(`ed-name-${id}`).value.trim() || ev.name;
  ev.time = document.getElementById(`ed-time-${id}`).value || ev.time;
  ev.capacity = parseInt(document.getElementById(`ed-cap-${id}`).value, 10) || ev.capacity;
  if (ev.occupied > ev.capacity) ev.occupied = ev.capacity;
  EL.toast("Cambios guardados");
  renderMyEvents();
};
// US14 cancelar evento (con confirmacion + notificacion a asistentes potenciales)
Views._cancelEvent = function (id) {
  const ev = EL.store.getEvent(id); if (!ev) return;
  EL.confirm(
    `¿Cancelar "${ev.name}"? Se quitará del mapa y se avisará a quienes lo guardaron. Esta acción no se puede deshacer.`,
    () => {
      EL.store.cancelEvent(id);
      EL.store.addNotification({ icon: ICON.x, title: "Evento cancelado", body: `Avisamos a los asistentes potenciales de "${ev.name}".`, view: "mis-eventos" });
      EL.renderNotifBell();
      if (typeof refreshMapMarkers === "function") refreshMapMarkers(true);
      EL.toast("Evento cancelado");
      renderMyEvents();
    },
    { title: "Cancelar evento", okText: "Sí, cancelar", danger: true }
  );
};
// US17 duplicar evento (prellena el formulario de publicar)
Views._duplicate = function (id) {
  const ev = EL.store.getEvent(id); if (!ev) return;
  Views._duplicateData = {
    name: ev.name + " (copia)", category: ev.category, time: ev.time,
    address: ev.address, capacity: ev.capacity, durationMin: ev.durationMin,
    tags: (ev.tags || []).slice(0, MAX_TAGS), imgUrl: ev.imgUrl || null,
  };
  EL.go("publicar");
};
// US15 destacar (con confirmacion de "pago")
Views._feature = function (id) {
  const box = document.getElementById(`evAction-${id}`);
  box.innerHTML = `
    <div style="background:var(--paper-2);border-radius:10px;padding:14px;">
      <p style="font-size:13px;color:var(--t-on-light);margin-bottom:10px;">Destacar este evento en el mapa con borde luminoso y posición prioritaria.</p>
      <div class="row-2" style="margin-bottom:10px;">
        <button class="btn btn-outline btn-sm" onclick="Views._doFeature(${id},2)">2 h · S/ 15</button>
        <button class="btn btn-outline btn-sm" onclick="Views._doFeature(${id},6)">6 h · S/ 35</button>
      </div>
    </div>`;
};
Views._doFeature = function (id, h) {
  const ev = EL.store.getEvent(id);
  document.getElementById(`evAction-${id}`).innerHTML = `<p style="font-size:13px;color:var(--t-on-light-dim)">Procesando…</p>`;
  setTimeout(() => { ev.featured = true; EL.toast(`Evento destacado por ${h} horas`); renderMyEvents(); }, 900);
};
// US38 visibilidad hiper-local
Views._promote = function (id) {
  const box = document.getElementById(`evAction-${id}`);
  box.innerHTML = `
    <div style="background:var(--paper-2);border-radius:10px;padding:14px;">
      <p style="font-size:13px;color:var(--t-on-light);margin-bottom:10px;">Promociona a usuarios dentro de 1 km de tu local durante una ventana de tiempo.</p>
      <div class="row-2">
        <button class="btn btn-outline btn-sm" onclick="Views._doPromote(${id},1)">1 h · S/ 12</button>
        <button class="btn btn-outline btn-sm" onclick="Views._doPromote(${id},3)">3 h · S/ 30</button>
      </div>
    </div>`;
};
Views._doPromote = function (id, h) {
  document.getElementById(`evAction-${id}`).innerHTML = `<p style="font-size:13px;color:var(--t-on-light-dim)">Procesando promoción…</p>`;
  setTimeout(() => { EL.toast(`Promoción activa por ${h} h en radio de 1 km`); renderMyEvents(); }, 900);
};

/* ---------- INTELIGENCIA (US21,23 Booms; US22 ROI; US24 DaaS; US25 Benchmark; US26 Heatmap; US27 SMART) ---------- */

Views.inteligencia = function (shell) {
  shell.innerHTML = `
    <div class="view-head"><h2>Inteligencia de mercado</h2><p>Detecta demanda, mide resultados y fija metas.</p></div>
    <div class="subtabs" id="intelTabs">
      <button class="subtab active" data-t="booms" onclick="Views._intelTab('booms')">Booms</button>
      <button class="subtab" data-t="heat" onclick="Views._intelTab('heat')">Mapa de calor</button>
      <button class="subtab" data-t="roi" onclick="Views._intelTab('roi')">ROI</button>
      <button class="subtab" data-t="bench" onclick="Views._intelTab('bench')">Benchmark</button>
      <button class="subtab" data-t="daas" onclick="Views._intelTab('daas')">Reportes</button>
      <button class="subtab" data-t="smart" onclick="Views._intelTab('smart')">Metas</button>
    </div>
    <div id="intelBody"></div>`;
  Views._intelTab("booms");
  EL.closeBurger(); window.scrollTo(0, 0);
};

Views._intelTab = function (t) {
  document.querySelectorAll("#intelTabs .subtab").forEach(b => b.classList.toggle("active", b.dataset.t === t));
  const body = document.getElementById("intelBody");
  if (t === "booms") return Views._renderBooms(body);
  if (t === "heat") return Views._renderHeat(body);
  if (t === "roi") return Views._renderROI(body);
  if (t === "bench") return Views._renderBench(body);
  if (t === "daas") return Views._renderDaaS(body);
  if (t === "smart") return Views._renderSmart(body);
};

/* ================== DATOS SIMULADOS DE ANALÍTICA ================== */
Views._analytics = {
  eventHistory: [
    { id: 1, nombre: "Concierto Indie Rock", categoria: "Música", fecha: "15/04/2026", inversion: 1200, alcance: 4800, asistencia: 340, precioEntrada: 15 },
    { id: 2, nombre: "Feria de Arte Barranco", categoria: "Arte", fecha: "28/03/2026", inversion: 800, alcance: 2900, asistencia: 195, precioEntrada: 0 },
    { id: 3, nombre: "Festival Gastronómico", categoria: "Gastronomía", fecha: "10/03/2026", inversion: 1500, alcance: 6200, asistencia: 480, precioEntrada: 20 },
    { id: 4, nombre: "Torneo Gaming Lima", categoria: "Gaming", fecha: "22/02/2026", inversion: 600, alcance: 3100, asistencia: 220, precioEntrada: 10 },
    { id: 5, nombre: "Jazz en Miraflores", categoria: "Música", fecha: "08/02/2026", inversion: 950, alcance: 3400, asistencia: 210, precioEntrada: 18 }
  ],
  daasZoneData: {
    "Barranco": { movilidad: { flujo: 12400, horaPico: "20:00–22:00", densidad: "Alta", eventos: 8, incremento: "+23%", categorias: ["Música en vivo", "Arte urbano", "Gastronomía"] }, consumo: { gastoPromedio: 85, asistentes: 4800, topEvento: "Noche de Jazz – Barranco", nps: 92 }, proyecciones: { demanda30d: "+18%", eventosEsperados: 34, confianza: 88, boomAlert: true } },
    "Miraflores": { movilidad: { flujo: 18700, horaPico: "12:00–14:00", densidad: "Muy Alta", eventos: 12, incremento: "+15%", categorias: ["Gastronomía", "Arte", "Bienestar"] }, consumo: { gastoPromedio: 120, asistentes: 7200, topEvento: "Feria Gastronómica – El Parque", nps: 88 }, proyecciones: { demanda30d: "+12%", eventosEsperados: 48, confianza: 91, boomAlert: false } },
    "San Isidro": { movilidad: { flujo: 21000, horaPico: "13:00–15:00", densidad: "Muy Alta", eventos: 6, incremento: "+8%", categorias: ["Bienestar", "Gastronomía", "Arte"] }, consumo: { gastoPromedio: 180, asistentes: 5600, topEvento: "Expo Arte Corporativo", nps: 90 }, proyecciones: { demanda30d: "+9%", eventosEsperados: 22, confianza: 94, boomAlert: false } }
  },
  daasReportHistory: [],
  benchmarkData: {
    "Música": { roi: { label: "ROI promedio", unit: "%", avg: 42, high: 110 }, asistencia: { label: "Asistencia por evento", unit: "personas", avg: 280, high: 520 }, inversion: { label: "Inversión por evento", unit: "S/", avg: 980, high: 1800, prefix: true }, alcance: { label: "Alcance total", unit: "personas", avg: 4200, high: 7000 }, precio: { label: "Precio de entrada", unit: "S/", avg: 14, high: 35, prefix: true }, frecuencia: { label: "Eventos / mes", unit: "eventos", avg: 1.8, high: 4 } },
    "Arte": { roi: { label: "ROI promedio", unit: "%", avg: 18, high: 80 }, asistencia: { label: "Asistencia por evento", unit: "personas", avg: 178, high: 380 }, inversion: { label: "Inversión por evento", unit: "S/", avg: 750, high: 1500, prefix: true }, alcance: { label: "Alcance total", unit: "personas", avg: 2500, high: 5000 }, precio: { label: "Precio de entrada", unit: "S/", avg: 4, high: 20, prefix: true }, frecuencia: { label: "Eventos / mes", unit: "eventos", avg: 1.3, high: 3 } }
  },
  smartMetricDefs: {
    asistencia: { label: "Asistencia por evento", unit: "personas", prefix: false }, roi: { label: "ROI promedio", unit: "%", prefix: false }, eventos: { label: "Eventos publicados", unit: "eventos", prefix: false }, alcance: { label: "Alcance total", unit: "personas", prefix: false }, ingresos: { label: "Ingresos totales", unit: "S/", prefix: true }
  },
  smartGoals: [],
  smartNextId: 1
};

/* ================== US21, US23: BOOMS ================== */
Views._renderBooms = function (body) {
  body.innerHTML = `
    <div class="panel">
      <div class="panel-title">Detección de Booms culturales</div>
      <div class="panel-sub">Tendencias emergentes por zona en las últimas 4 horas.</div>
      <button class="btn btn-primary" onclick="Views._runBooms()">${ICON.trend} Analizar tendencias</button>
      <div id="boomResult" style="margin-top:16px;"></div>
    </div>`;
};
Views._runBooms = function () {
  const r = document.getElementById("boomResult");
  r.innerHTML = `<p style="font-size:13px;color:var(--t-on-light-dim)">Procesando datos de movilidad y búsquedas…</p>`;
  setTimeout(() => {
    r.innerHTML = `
      <div class="list-row"><div class="info"><b>Barranco</b><p>Música en vivo · ventana óptima: Hoy 20:00 – 23:00</p></div>
      <div style="display:flex;align-items:center;gap:12px;"><span class="pill pill-ok">87% demanda</span><button class="btn btn-primary btn-sm" onclick="EL.go('publicar')">Publicar aquí</button></div></div>
      <p style="font-size:12px;color:var(--t-on-light-dim);margin-top:10px;">Recibirás un aviso cuando surja un Boom que coincida con tu categoría habitual.</p>`;
    EL.store.addNotification({ icon: ICON.bolt, title: "Boom detectado en Barranco", body: "Música en vivo · 87% de demanda.", view: "inteligencia" });
    EL.renderNotifBell();
    EL.toast("Análisis completado");
  }, 1200);
};

/* ================== US26: HEATMAP (Mapa de Calor con Leaflet) ================== */
Views._renderHeat = function (body) {
  // Mantenemos la leyenda y el contenedor tal como lo diseñaste originalmente
  body.innerHTML = `
    <div class="panel">
      <div class="panel-title">Mapa de calor de demanda</div>
      <div class="panel-sub">Zonas con mayor concentración de interés cultural ahora.</div>
      <div class="leafmap" id="heatMap"></div>
      <div style="display:flex;gap:16px;margin-top:12px;font-size:13px;color:var(--t-on-light-dim);align-items:center;">
        <span style="display:flex;align-items:center;gap:6px;"><span style="width:14px;height:14px;border-radius:3px;background:var(--ok);"></span>Demanda baja</span>
        <span style="display:flex;align-items:center;gap:6px;"><span style="width:14px;height:14px;border-radius:3px;background:var(--warn);"></span>Media</span>
        <span style="display:flex;align-items:center;gap:6px;"><span style="width:14px;height:14px;border-radius:3px;background:var(--err);"></span>Alta</span>
      </div>
    </div>`;

  // Inicialización de Leaflet asegurando que el DOM esté listo
  setTimeout(() => {
    const el = document.getElementById("heatMap");
    if (!el) return;
    
    // Se utiliza la variable global USER_POS definida en map.js
    const hm = L.map(el).setView(USER_POS, 13);
    
    // Capa base de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { 
      maxZoom: 19, 
      attribution: "© OpenStreetMap" 
    }).addTo(hm);

    // Toda tu data original de puntos de calor
    const heat = [
      { lat: -12.1391, lng: -77.0217, i: 0.9 },
      { lat: -12.1462, lng: -77.0220, i: 0.7 },
      { lat: -12.1518, lng: -77.0210, i: 0.85 },
      { lat: -12.1035, lng: -77.0290, i: 0.4 },
      { lat: -12.1205, lng: -77.0290, i: 0.5 },
      { lat: -12.0931, lng: -77.0465, i: 0.6 },
    ];

    // Dibujado de círculos superpuestos para el efecto "glow" de mapa de calor
    heat.forEach(h => {
      // Asignación de colores usando las variables de tu CSS
      const color = h.i > 0.75 ? "var(--err)" : h.i > 0.5 ? "var(--warn)" : "var(--ok)";
      
      // Círculo exterior (más grande, más transparente)
      L.circle([h.lat, h.lng], { 
        radius: 350 + h.i * 450, 
        color: color, 
        weight: 0, 
        fillColor: color, 
        fillOpacity: .35 
      }).addTo(hm);
      
      // Círculo interior (más pequeño, más intenso)
      L.circle([h.lat, h.lng], { 
        radius: 150 + h.i * 200, 
        color: color, 
        weight: 0, 
        fillColor: color, 
        fillOpacity: .5 
      }).addTo(hm);
    });

    // Forzar recálculo del tamaño para evitar problemas de renderizado en pestañas ocultas
    setTimeout(() => hm.invalidateSize(), 120);
  }, 80);
};

/* ================== US22: ROI ================== */
Views._calcROI = function (ev) { return (((ev.asistencia * ev.precioEntrada - ev.inversion) / ev.inversion) * 100).toFixed(1); };

Views._renderROI = function (body) {
  const rows = Views._analytics.eventHistory.map((ev) => {
    const roi = parseFloat(Views._calcROI(ev));
    const roiColor = roi >= 0 ? "var(--ok)" : "var(--err)";
    return `
      <div class="list-row">
        <div class="info"><b style="color:var(--t-on-light);font-size:15px;">${ev.nombre}</b>
        <p style="font-size:13px;margin-top:3px;">${ev.fecha} · ${ev.categoria}</p></div>
        <div style="display:flex;align-items:center;gap:14px;">
          <span style="color:${roiColor};font-weight:800;font-size:15px;">ROI ${roi >= 0 ? '+' : ''}${roi}%</span>
          <button class="btn btn-primary btn-sm" onclick="Views._showRoiAnalysis(${ev.id})">Ver ROI</button>
        </div>
      </div>`;
  }).join("");

  body.innerHTML = `
    <div class="panel">
      <div class="panel-title">Análisis de ROI por Evento</div>
      <div class="panel-sub">Selecciona un evento finalizado para ver su análisis completo.</div>
      ${rows}
      <div id="roiAnalysisPanel"></div>
    </div>`;
};

Views._showRoiAnalysis = function (id) {
  const ev = Views._analytics.eventHistory.find(e => e.id === id); if (!ev) return;
  const roi = parseFloat(Views._calcROI(ev));
  const ingresos = ev.asistencia * ev.precioEntrada;
  const roiColor = roi >= 0 ? "var(--ok)" : "var(--err)";
  const bg = "var(--paper-2)";

  document.getElementById("roiAnalysisPanel").innerHTML = `
    <div style="margin-top:24px;background:var(--paper);border-radius:var(--r-lg);padding:24px;box-shadow:var(--sh-2);border-top:4px solid var(--cyan);">
      <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
        <div><h4 style="color:var(--t-on-light);font-size:20px;">${ev.nombre}</h4><p style="color:var(--t-on-light-dim);font-size:14px;">${ev.fecha} · ${ev.categoria}</p></div>
        <div style="background:${bg};border:2px solid ${roiColor};border-radius:12px;padding:10px 18px;text-align:center;">
          <div style="font-size:11px;font-weight:700;color:${roiColor};">ROI TOTAL</div>
          <div style="font-size:26px;font-weight:800;color:${roiColor};">${roi >= 0 ? '+' : ''}${roi}%</div>
        </div>
      </div>
      <div class="stat-tiles">
        <div class="tile"><div class="v">S/ ${ev.inversion}</div><div class="k">Inversión</div></div>
        <div class="tile"><div class="v brand">${ev.alcance}</div><div class="k">Alcance Total</div></div>
        <div class="tile"><div class="v">${ev.asistencia}</div><div class="k">Asistencia</div></div>
        <div class="tile"><div class="v" style="color:var(--ok)">S/ ${ingresos}</div><div class="k">Ingresos</div></div>
      </div>
      <p style="font-size:12px;color:var(--t-on-light-dim);margin-top:20px;">* Datos del historial. ROI = (Ingresos − Inversión) / Inversión × 100.</p>
    </div>`;
  document.getElementById("roiAnalysisPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  EL.toast(`Análisis ROI cargado: ${ev.nombre}`);
};

/* ================== US24: DaaS ================== */
Views._renderDaaS = function (body) {
  body.innerHTML = `
    <div class="panel">
      <div class="panel-title">Reportes DaaS – Inteligencia de Movilidad</div>
      <div class="panel-sub">Genera reportes auditables por zona y rango de fechas.</div>
      <form id="daasForm" onsubmit="return Views._handleDaasGenerate(event)">
        <div class="row-2" style="margin-bottom:16px;">
          <div class="field"><label>Zona</label><select id="daasZone"><option value="Barranco">Barranco</option><option value="Miraflores">Miraflores</option><option value="San Isidro">San Isidro</option></select></div>
          <div class="field"><label>Tipo</label><select id="daasType"><option value="movilidad">Movilidad urbana</option><option value="consumo">Consumo cultural</option><option value="proyecciones">Proyecciones</option></select></div>
        </div>
        <button type="submit" class="btn btn-primary" id="daasGenerateBtn">${ICON.download} Generar reporte PDF</button>
      </form>
      <div id="daasProgress" style="display:none;margin-top:20px;text-align:center;"><p style="font-size:13px;color:var(--t-on-light-dim);">Compilando datos…</p></div>
      <div id="daasResult"></div>
      <div id="daasHistory" style="margin-top:24px;"></div>
    </div>`;
  Views._renderDaasHistory();
};

Views._handleDaasGenerate = function (e) {
  e.preventDefault();
  const zone = document.getElementById("daasZone").value, type = document.getElementById("daasType").value;
  document.getElementById("daasProgress").style.display = "block";
  document.getElementById("daasGenerateBtn").disabled = true;

  setTimeout(() => {
    document.getElementById("daasProgress").style.display = "none";
    document.getElementById("daasGenerateBtn").disabled = false;
    const reportId = "RPT-" + Date.now().toString(36).toUpperCase();
    Views._analytics.daasReportHistory.unshift({ reportId, zone, type, date: new Date().toLocaleDateString("es-PE") });
    EL.toast(`Reporte ${reportId} generado`);
    Views._renderDaasHistory();
  }, 1200);
};

Views._renderDaasHistory = function () {
  const hist = document.getElementById("daasHistory");
  if (!Views._analytics.daasReportHistory.length) return;
  hist.innerHTML = `<h5 style="font-size:15px;margin-bottom:12px;color:var(--t-on-light)">Mis reportes DaaS</h5>` + 
    Views._analytics.daasReportHistory.map(r => `
      <div class="list-row"><div class="info"><b>${r.type.toUpperCase()} — ${r.zone}</b><p>ID: ${r.reportId} · ${r.date}</p></div>
      <button class="btn btn-primary btn-sm" onclick="Views._downloadDaaS('${r.reportId}')">Descargar PDF</button></div>`).join("");
};

Views._downloadDaaS = function (id) {
  const r = Views._analytics.daasReportHistory.find(x => x.reportId === id); if (!r) return;
  _printHTML(`Reporte DaaS - ${r.zone}`, `<h1>Reporte DaaS: ${r.type} en ${r.zone}</h1><p>ID: ${r.reportId} · Datos auditables de movilidad generados por EventLive.</p>`);
  EL.toast("Abriendo PDF para guardar…");
};

/* ================== US25: BENCHMARK ================== */
Views._renderBench = function (body) {
  body.innerHTML = `
    <div class="panel">
      <div class="panel-title">Benchmark competitivo</div>
      <div class="panel-sub">Compara tu desempeño frente al promedio anónimo de organizadores.</div>
      <div class="row-2" style="margin-bottom:16px;">
        <div class="field"><label>Mi categoría</label><select id="bmCat"><option value="Música">Música</option><option value="Arte">Arte</option></select></div>
        <div class="field"><label>Zona</label><select id="bmZone"><option value="Barranco">Barranco</option><option value="Miraflores">Miraflores</option></select></div>
      </div>
      <button class="btn btn-primary" id="bmRunBtn" onclick="Views._runBenchmark()">Analizar mi posición</button>
      <div id="bmResult" style="margin-top:24px;"></div>
    </div>`;
};

Views._runBenchmark = function () {
  const cat = document.getElementById("bmCat").value, res = document.getElementById("bmResult");
  res.innerHTML = `<p style="font-size:13px;color:var(--t-on-light-dim)">Comparando con organizadores anónimos…</p>`;
  setTimeout(() => {
    const bench = Views._analytics.benchmarkData[cat] || Views._analytics.benchmarkData["Música"];
    res.innerHTML = `
      <div style="background:var(--paper-2);border-radius:var(--r);padding:20px;border-left:4px solid var(--ok);">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <b style="color:var(--t-on-light)">Asistencia por evento</b><span class="pill pill-ok">▲ Por encima</span>
        </div>
        <div style="font-size:13px;color:var(--t-on-light);margin-bottom:6px;display:flex;justify-content:space-between;"><span>Tu valor: <b>340</b></span><span>Promedio: <b>${bench.asistencia.avg}</b></span></div>
        <div style="height:10px;background:var(--line);border-radius:5px;overflow:hidden;margin-bottom:12px;"><div style="width:75%;height:100%;background:var(--ok);"></div></div>
        <p style="font-size:12px;color:var(--t-on-light-dim);">Tu convocatoria es superior al nicho. Buen indicador de posicionamiento de marca.</p>
      </div>`;
    EL.toast(`Benchmark generado para ${cat}`);
  }, 1000);
};

/* ================== US27: SMART GOALS ================== */
Views._renderSmart = function (body) {
  body.innerHTML = `
    <div class="panel">
      <div class="panel-title">Mis metas SMART</div>
      <div class="panel-sub">Define objetivos medibles y haz seguimiento.</div>
      <div style="background:var(--paper-2);padding:20px;border-radius:var(--r);margin-bottom:20px;">
        <form id="smartForm" onsubmit="return Views._handleSmartSubmit(event)">
          <div class="field"><label>Específica (¿Qué lograr?)</label><input id="smSpecific" placeholder="Ej. Aumentar asistencia" required /></div>
          <div class="row-2">
            <div class="field"><label>Métrica</label><select id="smMetric"><option value="asistencia">Asistencia</option><option value="roi">ROI</option></select></div>
            <div class="field"><label>Objetivo numérico</label><input type="number" id="smTarget" min="1" required /></div>
          </div>
          <div class="row-2">
            <div class="field"><label>Relevancia</label><input id="smRelevant" placeholder="Ej. Mejorar rentabilidad" required /></div>
            <div class="field"><label>Fecha límite</label><input type="date" id="smDeadline" required /></div>
          </div>
          <button type="submit" class="btn btn-primary">Guardar meta SMART</button>
        </form>
      </div>
      <div id="smartGoalsList"></div>
    </div>`;
  Views._renderSmartGoalsList();
};

Views._handleSmartSubmit = function (e) {
  e.preventDefault();
  Views._analytics.smartGoals.unshift({
    id: Views._analytics.smartNextId++,
    specific: document.getElementById("smSpecific").value,
    metric: document.getElementById("smMetric").value,
    target: document.getElementById("smTarget").value,
    deadline: document.getElementById("smDeadline").value
  });
  e.target.reset();
  EL.toast("Meta SMART guardada");
  Views._renderSmartGoalsList();
};

Views._renderSmartGoalsList = function () {
  const el = document.getElementById("smartGoalsList");
  if (!Views._analytics.smartGoals.length) { el.innerHTML = `<div class="empty">${ICON.target}<h4>Sin metas</h4></div>`; return; }
  
  el.innerHTML = Views._analytics.smartGoals.map((g) => {
    const pct = Math.floor(Math.random() * 60) + 10; // Progreso simulado
    return `
      <div class="list-row" style="display:block;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div class="info"><b>${g.specific}</b><p>Meta: ${g.target} ${g.metric} · Límite: ${g.deadline}</p></div>
          <button class="btn btn-sm btn-icon danger-ic" onclick="Views._deleteSmartGoal(${g.id})">${ICON.trash}</button>
        </div>
        <div style="background:var(--paper-3);border-radius:99px;height:8px;overflow:hidden;margin-top:12px;"><div style="width:${pct}%;height:100%;background:var(--grad-brand);"></div></div>
        <small style="color:var(--t-on-light-dim)">Progreso: ${pct}%</small>
      </div>`;
  }).join("");
};

Views._deleteSmartGoal = function (id) {
  Views._analytics.smartGoals = Views._analytics.smartGoals.filter(g => g.id !== id);
  EL.toast("Meta eliminada");
  Views._renderSmartGoalsList();
};