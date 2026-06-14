/* ============================================================ */
/* EVENTLIVE - app.js                                           */
/* Nucleo comun: navegacion, autenticacion con rol, contenido   */
/* informativo, enrutador de vistas, modales accesibles,        */
/* notificaciones, confirmaciones y utilidades.                 */
/* ============================================================ */

const EL = {
  store: EventLiveStore,
  authMode: "login",
  pendingRole: "asistente",
  currentView: null,
  loginFails: 0,
  lockUntil: 0,
  modalStack: [],

  /* ===================== A11Y: helper de modales ===================== */
  // role="dialog"+aria-modal vienen del HTML; aqui gestionamos foco,
  // Escape y atrapado de foco (focus trap) + retorno de foco.
  openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m._lastFocus = document.activeElement;
    m.classList.add("open");
    m.setAttribute("aria-hidden", "false");
    if (!this.modalStack.includes(id)) this.modalStack.push(id);
    const f = this._focusables(m)[0];
    setTimeout(() => { (f || m).focus && (f || m).focus(); }, 30);
  },
  closeModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove("open");
    m.setAttribute("aria-hidden", "true");
    this.modalStack = this.modalStack.filter(x => x !== id);
    if (m._lastFocus && m._lastFocus.focus) m._lastFocus.focus();
  },
  _focusables(root) {
    return [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter(el => el.offsetParent !== null);
  },
  _trapFocus(e) {
    const id = this.modalStack[this.modalStack.length - 1];
    const m = document.getElementById(id); if (!m) return;
    const f = this._focusables(m); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  },
  closeTopModal() {
    const id = this.modalStack[this.modalStack.length - 1];
    if (id === "authModal") return this.closeAuth();
    if (id === "eventModal") return this.closeEvent();
    if (id === "confirmModal") return this.confirmNo();
    if (id === "onboardModal") return this.skipOnboarding();
    if (id === "orgModal") return this.closeModal("orgModal");
    if (id) this.closeModal(id);
  },
  // activar por teclado elementos no-boton (Enter/Espacio)
  kAct(e, fn) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } },

  /* ===================== INFORMATIVO: contenido ===================== */
  renderInfoContent() {
    const feats = [
      { ico: ICON.pin, t: "Mapa en tiempo real", d: "Eventos activos cerca de ti ahora mismo, no una cartelera estática. Filtra por distancia y por lo que te gusta." },
      { ico: ICON.shield, t: "Verificación por geofencing", d: "Solo los eventos con presencia confirmada por GPS reciben el sello verificado. Se acabó la información falsa." },
      { ico: ICON.bell, t: "Avisos por cercanía", d: "Recibe una alerta cuando algo de tu interés ocurre a pocos metros mientras te mueves por la ciudad." },
    ];
    document.getElementById("featGrid").innerHTML = feats.map(f => `
      <article class="feat">
        <div class="feat-ico" style="color:var(--cyan)">${f.ico}</div>
        <h3>${f.t}</h3><p>${f.d}</p>
      </article>`).join("");

    const steps = [
      { t: "Crea tu cuenta", d: "Elige si vienes a descubrir eventos o a publicarlos, y cuéntanos qué te interesa." },
      { t: "Abre el mapa", d: "Mira qué pasa cerca, filtra por distancia y categoría, y abre la ficha de cualquier evento." },
      { t: "Vive el plan", d: "Recibe avisos por cercanía, guarda favoritos y sigue a los organizadores que te gustan." },
    ];
    document.getElementById("stepsGrid").innerHTML = steps.map((s, i) => `
      <div class="step"><div class="num">${i + 1}</div><h4>${s.t}</h4><p>${s.d}</p></div>`).join("");

    const benefits = [
      "Publica un evento en menos de un minuto",
      "Mide asistencia real verificada por GPS",
      "Descubre dónde está la demanda con datos de la zona",
      "Promociona a quienes están a metros de tu local",
    ];
    document.getElementById("orgList").innerHTML = benefits.map(b => `
      <li>${ICON.check.replace('stroke="currentColor"', 'stroke="#A6E22E"')}<span>${b}</span></li>`).join("");

    const tst = [
      { txt: "Antes pasaba media hora buscando algo que hacer. Ahora abro EventLive y en dos minutos tengo plan a cuatro cuadras.", n: "Mateo Sifuentes", r: "Estudiante · Chorrillos", av: "MS" },
      { txt: "El sello de verificado me da tranquilidad. Ya no llego a eventos que resultaron cancelados o que ni existían.", n: "Lucía Bermúdez", r: "Joven profesional · Surco", av: "LB" },
      { txt: "Como organizadora, detecté la demanda en mi zona y agoté el aforo esa noche. Mejor que pagar publicidad masiva.", n: "Valeria Rodríguez", r: "Gestora cultural · Miraflores", av: "VR" },
    ];
    document.getElementById("tstGrid").innerHTML = tst.map(t => `
      <article class="tst">
        <div class="stars" aria-label="5 de 5 estrellas">${ICON.star}${ICON.star}${ICON.star}${ICON.star}${ICON.star}</div>
        <p>"${t.txt}"</p>
        <div class="who"><div class="av" aria-hidden="true">${t.av}</div><div><b>${t.n}</b><small>${t.r}</small></div></div>
      </article>`).join("");
  },

  scrollTo(id) { const e = document.getElementById(id); if (e) e.scrollIntoView({ behavior: "smooth" }); this.closeBurger(); },
  goHome() {
    if (this.store.session.loggedIn) { this.go(this.defaultView()); }
    else { this.scrollTo("inicio"); }
  },

  /* ===================== AUTH ===================== */
  openAuth(mode, role) {
    this.switchAuth(mode || "login");
    if (role) this.pickRole(role);
    this.openModal("authModal");
  },
  closeAuth() { this.clearAuthErrors(); this.closeModal("authModal"); },
  switchAuth(mode) {
    this.authMode = mode;
    const reg = mode === "register";
    document.getElementById("tabLogin").classList.toggle("active", !reg);
    document.getElementById("tabLogin").setAttribute("aria-selected", String(!reg));
    document.getElementById("tabRegister").classList.toggle("active", reg);
    document.getElementById("tabRegister").setAttribute("aria-selected", String(reg));
    document.getElementById("nameField").style.display = reg ? "block" : "none";
    document.getElementById("roleBlock").style.display = reg ? "block" : "none";
    document.getElementById("forgotRow").style.display = reg ? "none" : "block";
    document.getElementById("aPass").setAttribute("autocomplete", reg ? "new-password" : "current-password");
    document.getElementById("passHint").textContent = reg
      ? "Mínimo 8 caracteres, con al menos una mayúscula y un número."
      : "Ingresa tu contraseña.";
    document.getElementById("authSubmitBtn").textContent = reg ? "Crear cuenta" : "Iniciar sesión";
    this.clearAuthErrors();
  },
  pickRole(role) {
    this.pendingRole = role;
    document.getElementById("roleAsistente").classList.toggle("sel", role === "asistente");
    document.getElementById("roleAsistente").setAttribute("aria-pressed", String(role === "asistente"));
    document.getElementById("roleOrganizador").classList.toggle("sel", role === "organizador");
    document.getElementById("roleOrganizador").setAttribute("aria-pressed", String(role === "organizador"));
  },
  clearAuthErrors() {
    ["nameField", "emailField", "passField"].forEach(id => {
      const el = document.getElementById(id);
      el.classList.remove("invalid");
      const inp = el.querySelector("input"); if (inp) inp.setAttribute("aria-invalid", "false");
    });
  },
  _setInvalid(fieldId, msg) {
    const el = document.getElementById(fieldId);
    el.classList.add("invalid");
    const inp = el.querySelector("input"); if (inp) inp.setAttribute("aria-invalid", "true");
    if (msg) { const m = el.querySelector(".err-msg"); if (m) m.textContent = msg; }
  },
  submitAuth(e) {
    e.preventDefault();
    this.clearAuthErrors();
    const reg = this.authMode === "register";

    // US41: bloqueo temporal tras 5 intentos fallidos
    if (!reg && Date.now() < this.lockUntil) {
      const mins = Math.ceil((this.lockUntil - Date.now()) / 60000);
      this.toast(`Cuenta bloqueada por seguridad. Intenta en ${mins} min.`); return false;
    }

    const name = document.getElementById("aName").value.trim();
    const email = document.getElementById("aEmail").value.trim();
    const pass = document.getElementById("aPass").value;
    let ok = true;

    if (reg && !name) { this._setInvalid("nameField", "Ingresa tu nombre."); ok = false; }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { this._setInvalid("emailField", "Ingresa un correo válido."); ok = false; }
    // US40: contraseña con mayuscula y numero, min 8
    if (reg) {
      if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass)) {
        this._setInvalid("passField", "Mínimo 8 caracteres, con una mayúscula y un número."); ok = false;
      }
      // US40 Escenario 2: correo ya registrado
      if (email && this.store.takenEmails.includes(email.toLowerCase())) {
        this._setInvalid("emailField", "Este correo ya está registrado, ¿olvidaste tu contraseña?"); ok = false;
      }
    } else {
      if (!pass || pass.length < 8) { this._setInvalid("passField", "La contraseña debe tener al menos 8 caracteres."); ok = false; }
    }

    if (!ok) {
      if (!reg) {
        this.loginFails++;
        if (this.loginFails >= 5) { this.lockUntil = Date.now() + 15 * 60000; this.loginFails = 0; this.toast("Demasiados intentos. Cuenta bloqueada 15 min."); }
      }
      return false;
    }

    this.loginFails = 0;
    if (reg) this.store.takenEmails.push(email.toLowerCase());
    this._loginAs(reg ? this.pendingRole : (this.pendingRole || "asistente"), name || email.split("@")[0], email, reg);
    this.toast(reg ? "Cuenta creada. Bienvenido a EventLive" : "Bienvenido de vuelta");
    return false;
  },
  // US42: OAuth simulado
  oauth(provider) {
    const name = provider === "google" ? "Usuario Google" : "Usuario Apple";
    this._loginAs(this.pendingRole || "asistente", name, `${provider}@cuenta.com`, this.authMode === "register");
    this.toast(`Sesión iniciada con ${provider === "google" ? "Google" : "Apple"}`);
  },
  // US43: recuperación de contraseña simulada
  forgotPassword() {
    const email = (document.getElementById("aEmail").value || "").trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { this._setInvalid("emailField", "Escribe tu correo para enviarte el enlace."); return; }
    this.toast("Te enviamos un enlace de recuperación (vigencia 1 hora).");
  },
  _loginAs(role, name, email, isNew) {
    this.store.session.loggedIn = true;
    this.store.session.role = role;
    this.store.session.canOrganize = role === "organizador";
    this.store.session.user = { name, email, isNew };
    this.closeAuth();
    this.enterApp();
  },
  logout() {
    this.store.session = { loggedIn: false, user: null, role: null, canOrganize: false };
    this.store.notifications = [];
    document.getElementById("appMode").style.display = "none";
    document.getElementById("infoMode").style.display = "block";
    document.getElementById("infoMenu").style.display = "";
    document.getElementById("infoActions").style.display = "";
    document.getElementById("appMenu").style.display = "none";
    document.getElementById("appActions").style.display = "none";
    document.getElementById("nav").classList.remove("menu-open");
    this.closeNotifs();
    window.scrollTo(0, 0);
    this.toast("Sesión cerrada");
  },

  /* ===================== ROL (US44) ===================== */
  becomeOrganizer() { this.openModal("orgModal"); },
  submitOrg(e) {
    e.preventDefault();
    const ruc = document.getElementById("orgRuc").value.trim();
    const com = document.getElementById("orgName").value.trim();
    const act = document.getElementById("orgAct").value;
    if (!/^\d{11}$/.test(ruc) || !com || !act) { this.toast("Completa RUC (11 dígitos), nombre comercial y actividad."); return false; }
    this.store.session.canOrganize = true;
    this.store.session.role = "organizador";
    this.closeModal("orgModal");
    this.enterApp();
    this.toast("¡Listo! Ahora también eres organizador.");
    return false;
  },
  switchRole(role) {
    if (role === "organizador" && !this.store.session.canOrganize) return this.becomeOrganizer();
    this.store.session.role = role;
    this.enterApp();
    this.toast(role === "organizador" ? "Modo Organizador" : "Modo Asistente");
  },

  /* ===================== ENTRAR A LA APP ===================== */
  defaultView() { return "mapa"; },
  enterApp() {
    document.getElementById("infoMode").style.display = "none";
    document.getElementById("appMode").style.display = "block";
    document.getElementById("infoMenu").style.display = "none";
    document.getElementById("infoActions").style.display = "none";
    document.getElementById("appMenu").style.display = "flex";
    document.getElementById("appActions").style.display = "flex";

    const role = this.store.session.role;
    document.getElementById("rolePill").textContent = role === "organizador" ? "Organizador" : "Asistente";
    document.getElementById("userName").textContent = this.store.session.user.name;
    this._renderRoleSwitch();
    this.renderNotifBell();

    const menus = role === "organizador"
      ? [["mapa", "Mapa"], ["publicar", "Publicar"], ["mis-eventos", "Mis eventos"], ["inteligencia", "Inteligencia"]]
      : [["mapa", "Mapa"], ["para-ti", "Para ti"], ["favoritos", "Favoritos"], ["comunidades", "Comunidades"], ["perfil", "Mi perfil"]];
    document.getElementById("appMenu").innerHTML = menus.map(m =>
      `<a href="#" role="menuitem" onclick="EL.go('${m[0]}');return false;" data-view="${m[0]}">${m[1]}</a>`).join("");

    // US28: onboarding de intereses al primer ingreso como asistente sin intereses
    if (role === "asistente" && this.store.session.user.isNew && this.store.userInterests.length === 0) {
      this.go(this.defaultView());
      setTimeout(() => Views.onboardInterests(), 350);
    } else {
      this.go(this.defaultView());
    }
    // US23: alerta de IA para organizador (oportunidad detectada)
    if (role === "organizador") {
      setTimeout(() => {
        const n = this.store.addNotification({ icon: ICON.bolt, title: "Oportunidad detectada por IA", body: "Alta demanda de Música en Barranco hoy 20:00–23:00.", view: "inteligencia" });
        this.renderNotifBell();
        this.notifyToast(n);
      }, 3200);
    }
    window.scrollTo(0, 0);
  },
  _renderRoleSwitch() {
    const el = document.getElementById("roleSwitch"); if (!el) return;
    const role = this.store.session.role;
    if (this.store.session.canOrganize) {
      const other = role === "organizador" ? "asistente" : "organizador";
      el.style.display = "inline-flex";
      el.innerHTML = `<button class="btn btn-ghost-light btn-sm" onclick="EL.switchRole('${other}')" title="Cambiar de modo">${ICON.swap}<span>Modo ${other === "organizador" ? "Organizador" : "Asistente"}</span></button>`;
    } else if (role === "asistente") {
      el.style.display = "inline-flex";
      el.innerHTML = `<button class="btn btn-ghost-light btn-sm" onclick="EL.becomeOrganizer()" title="Convertirme en organizador">${ICON.chart}<span>Ser organizador</span></button>`;
    } else { el.style.display = "none"; el.innerHTML = ""; }
  },

  /* ===================== ENRUTADOR ===================== */
  go(view) {
    this.currentView = view;
    document.querySelectorAll("#appMenu a").forEach(a => {
      const on = a.dataset.view === view;
      a.style.color = on ? "#fff" : "";
      a.style.background = on ? "rgba(234,244,248,.1)" : "";
      a.setAttribute("aria-current", on ? "page" : "false");
    });
    const shell = document.getElementById("appShell");
    const role = this.store.session.role;
    this.closeNotifs();

    if (view === "mapa") return Views.mapa(shell);
    if (role === "asistente") {
      if (view === "para-ti") return Views.paraTi(shell);
      if (view === "favoritos") return Views.favoritos(shell);
      if (view === "comunidades") return Views.comunidades(shell);
      if (view === "perfil") return Views.perfil(shell);
    } else {
      if (view === "publicar") return Views.publicar(shell);
      if (view === "mis-eventos") return Views.misEventos(shell);
      if (view === "inteligencia") return Views.inteligencia(shell);
    }
    this.closeBurger();
    window.scrollTo(0, 0);
  },

  /* ===================== FICHA DE EVENTO ===================== */
  // US04 ficha · US05 sello+timestamp+boton secundario · US10 compartir
  // US18 imagen real · US32 resenas publicas + bloqueo de no-asistentes
  // US33 seguir desde la ficha
  openEvent(id) {
    const ev = this.store.getEvent(id);
    if (!ev) return;
    const aforoPct = Math.round((ev.occupied / ev.capacity) * 100);
    const lleno = ev.occupied >= ev.capacity;
    const isAtt = this.store.session.role === "asistente";
    const fav = this.store.isFavorite(id);
    const following = this.store.isFollowing(ev.organizer);
    const heroBg = ev.imgUrl ? `background:url(${ev.imgUrl}) center/cover` : `background:${ev.img}`;
    const reviews = this.store.getEventReviews(id);
    const attended = this.store.hasAttended(id);

    document.getElementById("eventModalTitle").textContent = ev.name;
    document.getElementById("eventModalBody").innerHTML = `
      <div class="detail-hero" style="${heroBg}">
        <span class="cat">${ev.category}</span>
        ${ev.cancelled ? `<span class="cat" style="left:auto;right:14px;background:var(--err)">Cancelado</span>` : ""}
      </div>
      <div class="modal-pad">
        <h2 style="font-size:22px;color:var(--t-on-light);margin-bottom:4px;">${ev.name}</h2>
        <p style="color:var(--t-on-light-dim);font-size:14px;margin-bottom:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span>Organiza: ${ev.organizer}</span>
          ${isAtt ? `<button class="btn btn-sm ${following ? "btn-outline" : "btn-primary"}" onclick="EL.followFromModal('${ev.organizer.replace(/'/g, "")}')" id="modalFollowBtn">${following ? "Siguiendo" : "Seguir"}</button>` : ""}
        </p>
        ${ev.verified
          ? `<span class="pill pill-ok">${ICON.shield} Verificado por geofencing</span>
             <span class="verif-ts">Última validación: ${ev.verifiedAt || "reciente"}</span>`
          : `<span class="pill pill-warn">Información no verificada</span>`}
        <div style="margin-top:16px;">
          <div class="detail-row">${ICON.pin}<span>${ev.address}</span></div>
          <div class="detail-row">${ICON.clock}<span>Inicia ${ev.time} · dura aprox. ${Math.round(ev.durationMin / 60)} h</span></div>
          <div class="detail-row">${ICON.users}<span>Aforo ${ev.occupied} / ${ev.capacity} ${lleno ? '<b style="color:var(--err)">· Lleno</b>' : `· ${aforoPct}% ocupado`}</span></div>
        </div>
        <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;">
          <button class="btn ${ev.verified ? "btn-primary" : "btn-outline"}" style="flex:1;min-width:150px" onclick="EL.routeTo(${ev.lat},${ev.lng})">${ICON.route} Cómo llegar</button>
          <button class="btn btn-outline btn-icon" onclick="EL.shareEvent(${id})" aria-label="Compartir evento">${ICON.share}</button>
          ${isAtt ? `<button class="btn btn-outline btn-icon" onclick="EL.favFromModal(${id})" id="modalFavBtn" aria-label="${fav ? "Quitar de favoritos" : "Guardar en favoritos"}">${fav ? ICON.heart : ICON.heartline}</button>` : ""}
        </div>
        ${!ev.verified ? `<p class="caution-note">${ICON.shield} Este evento aún no fue validado en sitio. Confirma antes de trasladarte.</p>` : ""}

        <!-- US32: resenas publicas + accion segun asistencia -->
        <div class="reviews-block">
          <div class="panel-title" style="font-size:15px;">Reseñas ${reviews.length ? `(${reviews.length})` : ""}</div>
          ${isAtt ? (attended
            ? `<button class="btn btn-outline btn-sm" style="margin:8px 0" onclick="EL.reviewEvent(${id})">${ICON.starline} Reseñar este evento</button>`
            : `<p class="review-locked">${ICON.shield} Solo puedes reseñar eventos a los que hayas asistido. ¿Te interesa para la próxima?
                 <button class="btn btn-sm btn-outline" onclick="EL.favFromModal(${id})">Guardar como favorito</button></p>`) : ""}
          <div id="evReviews">${this._reviewsHTML(reviews)}</div>
        </div>
      </div>`;
    this.openModal("eventModal");
  },
  _reviewsHTML(reviews) {
    if (!reviews.length) return `<p style="color:var(--t-on-light-dim);font-size:13px;">Aún no hay reseñas. Sé el primero en compartir tu experiencia.</p>`;
    return reviews.map(r => {
      let stars = ""; for (let i = 1; i <= 5; i++) stars += `<span style="color:var(--lime)" aria-hidden="true">${i <= r.rating ? "★" : "☆"}</span>`;
      return `<div class="review-row">
        <div class="review-top"><b>${r.author}</b>${r.verified ? `<span class="pill pill-ok" style="font-size:11px;padding:2px 8px;">Asistencia verificada</span>` : ""}<small>${r.date}</small></div>
        <div aria-label="${r.rating} de 5">${stars}</div>
        ${r.text ? `<p>"${r.text}"</p>` : ""}
      </div>`;
    }).join("");
  },
  closeEvent() { this.closeModal("eventModal"); },
  routeTo(lat, lng) {
    const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
    const url = isApple ? `https://maps.apple.com/?daddr=${lat},${lng}` : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
    this.toast(isApple ? "Abriendo ruta en Apple Maps" : "Abriendo ruta en Google Maps");
  },
  favFromModal(id) {
    const added = this.store.toggleFavorite(id);
    const btn = document.getElementById("modalFavBtn");
    if (btn) { btn.innerHTML = added ? ICON.heart : ICON.heartline; btn.setAttribute("aria-label", added ? "Quitar de favoritos" : "Guardar en favoritos"); }
    this.toast(added ? "Guardado en favoritos" : "Quitado de favoritos");
    if (this.currentView === "favoritos") this.go("favoritos");
    if (typeof refreshMapMarkers === "function") refreshMapMarkers();
  },
  followFromModal(name) {
    const f = this.store.toggleFollow(name);
    const btn = document.getElementById("modalFollowBtn");
    if (btn) { btn.textContent = f ? "Siguiendo" : "Seguir"; btn.className = "btn btn-sm " + (f ? "btn-outline" : "btn-primary"); }
    this.toast(f ? "Ahora sigues a " + name : "Dejaste de seguir");
  },
  reviewEvent(id) { openReviewModal(id, this.store.getEvent(id).name); },
  // US10: compartir (Web Share API con respaldo a copiar enlace)
  shareEvent(id) {
    const ev = this.store.getEvent(id);
    const url = `${location.origin}${location.pathname}#evento-${id}`;
    const data = { title: ev.name, text: `${ev.name} · ${ev.address} · ${ev.time}`, url };
    if (navigator.share) { navigator.share(data).catch(() => {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(`${data.text} ${url}`); this.toast("Enlace copiado para compartir"); }
    else { this.toast("Comparte: " + url); }
  },

  /* ===================== PROXIMIDAD (US06) ===================== */
  // Escenario 1: con intereses configurados, coincidencia de categoria, 500m.
  // Escenario 2: sin intereses, aviso promocional que lleva a configurar.
  proximity(payload) {
    const box = document.getElementById("proximity");
    if (payload.promo) {
      box.innerHTML = `
        <div class="px-head">
          <div>
            <b>Hay planes cerca de ti</b>
            <p>Configura tus intereses para recibir avisos personalizados cuando algo bueno pase a tu alrededor.</p>
            <button class="btn btn-primary btn-sm" onclick="EL.go('perfil');EL.hideProximity()">Configurar intereses</button>
          </div>
          <button class="px-x" onclick="EL.hideProximity()" aria-label="Cerrar aviso">${ICON.x}</button>
        </div>`;
    } else {
      const ev = payload;
      box.innerHTML = `
        <div class="px-head">
          <div>
            <b>Evento de tu interés cerca</b>
            <p>${ev.name} · ${ev.category} · a ${ev.distKm} km. ${ev.time}.</p>
            <button class="btn btn-primary btn-sm" onclick="EL.openEvent(${ev.id});EL.hideProximity()">Ver evento</button>
          </div>
          <button class="px-x" onclick="EL.hideProximity()" aria-label="Cerrar aviso">${ICON.x}</button>
        </div>`;
    }
    box.classList.add("show");
    clearTimeout(this._pxT);
    this._pxT = setTimeout(() => this.hideProximity(), 8000);
  },
  hideProximity() { document.getElementById("proximity").classList.remove("show"); },

  /* ===================== NOTIFICACIONES ===================== */
  renderNotifBell() {
    const wrap = document.getElementById("notifBell"); if (!wrap) return;
    const c = this.store.unreadCount();
    wrap.innerHTML = `
      <button class="icon-btn" id="notifToggle" aria-label="Notificaciones${c ? `, ${c} sin leer` : ""}" aria-expanded="false" aria-haspopup="true" onclick="EL.toggleNotifs()">
        ${ICON.bell}${c ? `<span class="notif-dot">${c}</span>` : ""}
      </button>
      <div class="notif-panel" id="notifPanel" role="region" aria-label="Notificaciones" hidden>
        <div class="notif-head"><b>Notificaciones</b>${this.store.notifications.length ? `<button class="link-btn" onclick="EL.clearNotifs()">Marcar leídas</button>` : ""}</div>
        <div class="notif-list">${this._notifListHTML()}</div>
      </div>`;
  },
  _notifListHTML() {
    const n = this.store.notifications;
    if (!n.length) return `<div class="notif-empty">${ICON.bell}<p>Sin notificaciones por ahora.</p></div>`;
    return n.map(x => `
      <button class="notif-item ${x.read ? "" : "unread"}" onclick="EL.openNotif(${x.id})">
        <span class="notif-ico">${x.icon || ICON.bell}</span>
        <span class="notif-txt"><b>${x.title}</b><span>${x.body}</span></span>
      </button>`).join("");
  },
  toggleNotifs() {
    const p = document.getElementById("notifPanel"); const t = document.getElementById("notifToggle");
    if (!p) return;
    const open = p.hasAttribute("hidden");
    if (open) { p.removeAttribute("hidden"); t.setAttribute("aria-expanded", "true"); }
    else { p.setAttribute("hidden", ""); t.setAttribute("aria-expanded", "false"); }
  },
  closeNotifs() { const p = document.getElementById("notifPanel"); if (p) { p.setAttribute("hidden", ""); const t = document.getElementById("notifToggle"); if (t) t.setAttribute("aria-expanded", "false"); } },
  clearNotifs() { this.store.markAllRead(); this.renderNotifBell(); },
  openNotif(id) {
    const n = this.store.notifications.find(x => x.id === id); if (!n) return;
    n.read = true;
    this.closeNotifs();
    if (n.view) this.go(n.view);
    else if (n.eventId) this.openEvent(n.eventId);
    this.renderNotifBell();
  },
  // toast enriquecido para anunciar una notificacion entrante
  notifyToast(n) { this.toast(n.title); this.renderNotifBell(); },

  /* ===================== VIDEO ===================== */
  playVideo() {
    document.getElementById("videoBox").innerHTML = `<div style="color:var(--t-on-dark-dim);text-align:center;padding:20px;"><p style="font-size:15px;">Aquí se incrusta el video About-the-Product.</p><p style="font-size:13px;margin-top:6px;">Reemplaza este bloque por el iframe de YouTube cuando el video esté listo.</p></div>`;
  },

  /* ===================== CONFIRMACION ===================== */
  // Dialogo reutilizable para acciones destructivas (heuristica: prevencion/control)
  confirm(message, onYes, opts = {}) {
    this._confirmYes = onYes;
    document.getElementById("confirmTitle").textContent = opts.title || "¿Confirmas la acción?";
    document.getElementById("confirmMsg").textContent = message;
    const btn = document.getElementById("confirmOk");
    btn.textContent = opts.okText || "Confirmar";
    btn.className = "btn btn-sm " + (opts.danger ? "btn-danger" : "btn-primary");
    this.openModal("confirmModal");
  },
  confirmNo() { this._confirmYes = null; this.closeModal("confirmModal"); },
  confirmDo() { const fn = this._confirmYes; this.closeModal("confirmModal"); if (fn) fn(); },

  /* ===================== UTILIDADES ===================== */
  toast(msg) {
    const stack = document.getElementById("toastStack");
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `${ICON.check}<span>${msg}</span>`;
    stack.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2600);
  },
  closeBurger() { document.getElementById("nav").classList.remove("menu-open"); },
};

/* Burger toggle */
document.getElementById("burger").addEventListener("click", () => {
  const nav = document.getElementById("nav");
  const open = nav.classList.toggle("menu-open");
  document.getElementById("burger").setAttribute("aria-expanded", String(open));
});

/* A11Y global: Escape cierra el modal superior; Tab queda atrapado */
document.addEventListener("keydown", (e) => {
  if (EL.modalStack.length) {
    if (e.key === "Escape") { e.preventDefault(); EL.closeTopModal(); }
    else if (e.key === "Tab") { EL._trapFocus(e); }
  }
});
/* Cerrar el panel de notificaciones al hacer clic fuera */
document.addEventListener("click", (e) => {
  const wrap = document.getElementById("notifBell");
  if (wrap && !wrap.contains(e.target)) EL.closeNotifs();
});

/* Init informativo */
EL.renderInfoContent();
