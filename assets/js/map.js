/* ============================================================ */
/* EVENTLIVE - map.js                                           */
/* Mapa REAL con Leaflet + OpenStreetMap. Vista compartida.     */
/* Cubre: mapa geolocalizado (US01 + Escenario sin GPS),        */
/* radio (US02 con toast), filtros multi-categoria (US03),      */
/* ficha (US04), sello (US05), glifo de categoria en pin (US19),*/
/* toggle mapa/lista (US08), proximidad (US06) e intereses(US28).*/
/* Mapa de calor (US26) se monta en la vista de inteligencia.   */
/* ============================================================ */

let _map = null;
let _markersLayer = null;
let _userMarker = null;
let _radiusCircle = null;
const USER_POS_DEFAULT = [-12.1300, -77.0220]; // Miraflores/Barranco (demo)
let USER_POS = USER_POS_DEFAULT.slice();
let _filterRadius = 5;            // km
let _filterCategories = [];        // [] = todas (US03 multi-seleccion)
let _gpsMode = null;               // null = sin decidir, 'gps', 'district' (US01 Esc.2)
let _viewMode = "mapa";            // 'mapa' | 'lista' (US08)
let _interestPrefilled = false;

// US19: glifo corto por categoria para el pin (sin emojis)
const CAT_GLYPH = { "Música": "M", "Arte": "A", "Gastronomía": "G", "Gaming": "J", "K-pop": "K", "Deporte": "D", "Teatro": "T", "Cine": "C" };

// US01 Escenario 2: 43 distritos de Lima Metropolitana con centroide aproximado
const DISTRICTS = [
  ["Lima (Cercado)", -12.0464, -77.0428], ["Ancón", -11.7758, -77.1769], ["Ate", -12.0264, -76.9178],
  ["Barranco", -12.1490, -77.0210], ["Breña", -12.0586, -77.0503], ["Carabayllo", -11.8975, -77.0356],
  ["Chaclacayo", -11.9858, -76.7686], ["Chorrillos", -12.1717, -77.0269], ["Cieneguilla", -12.1186, -76.8094],
  ["Comas", -11.9381, -77.0617], ["El Agustino", -12.0428, -77.0006], ["Independencia", -11.9897, -77.0531],
  ["Jesús María", -12.0747, -77.0494], ["La Molina", -12.0792, -76.9447], ["La Victoria", -12.0664, -77.0156],
  ["Lince", -12.0850, -77.0364], ["Los Olivos", -11.9697, -77.0700], ["Lurigancho (Chosica)", -11.9408, -76.7000],
  ["Lurín", -12.2700, -76.8731], ["Magdalena del Mar", -12.0931, -77.0719], ["Miraflores", -12.1211, -77.0297],
  ["Pachacámac", -12.2289, -76.8447], ["Pucusana", -12.4789, -76.7956], ["Pueblo Libre", -12.0747, -77.0633],
  ["Puente Piedra", -11.8639, -77.0750], ["Punta Hermosa", -12.3358, -76.8208], ["Punta Negra", -12.3656, -76.7950],
  ["Rímac", -12.0269, -77.0292], ["San Bartolo", -12.3892, -76.7789], ["San Borja", -12.1086, -76.9978],
  ["San Isidro", -12.0972, -77.0364], ["San Juan de Lurigancho", -11.9939, -76.9961], ["San Juan de Miraflores", -12.1597, -76.9706],
  ["San Luis", -12.0758, -76.9989], ["San Martín de Porres", -12.0017, -77.0850], ["San Miguel", -12.0772, -77.0903],
  ["Santa Anita", -12.0431, -76.9719], ["Santa María del Mar", -12.4031, -76.7775], ["Santa Rosa", -11.7900, -77.1689],
  ["Santiago de Surco", -12.1450, -76.9919], ["Surquillo", -12.1131, -77.0203], ["Villa El Salvador", -12.2136, -76.9389],
  ["Villa María del Triunfo", -12.1644, -76.9367],
];

function _distKm(a, b) {
  const R = 6371, dLat = (b[0] - a[0]) * Math.PI / 180, dLng = (b[1] - a[1]) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function _eventsInView() {
  return EL.store.activeEvents().filter(ev => {
    const d = _distKm(USER_POS, [ev.lat, ev.lng]);
    ev._dist = d;
    const okR = d <= _filterRadius;
    const okC = _filterCategories.length === 0 || _filterCategories.includes(ev.category);
    return okR && okC;
  });
}

function _pinIcon(ev) {
  const glyph = CAT_GLYPH[ev.category] || "•";
  return L.divIcon({
    className: "",
    html: `<div class="pin-marker ${ev.verified ? "verified-pin" : "normal-pin"}">
             <span class="pin-glyph" aria-hidden="true">${glyph}</span>
             ${ev.verified ? '<span class="pin-check" aria-hidden="true">✓</span>' : ""}
           </div>`,
    iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -30],
  });
}

function refreshMapMarkers(skipFade) {
  if (!_map || !_markersLayer) return;
  const paint = () => {
    _markersLayer.clearLayers();
    const list = _eventsInView();
    list.forEach(ev => {
      const m = L.marker([ev.lat, ev.lng], { icon: _pinIcon(ev) }).addTo(_markersLayer);
      const aforo = Math.round((ev.occupied / ev.capacity) * 100);
      m.bindPopup(`
        <div class="lp-title">${ev.name}</div>
        <div class="lp-meta">${ev.category} · ${ev._dist.toFixed(1)} km · ${ev.verified ? "Verificado" : "Sin verificar"} · Aforo ${aforo}%</div>
        <button class="lp-btn" onclick="EL.openEvent(${ev.id})">Ver detalle</button>`);
    });
    const listEl = document.getElementById("mapEventList");
    if (listEl) {
      listEl.innerHTML = list.length === 0
        ? `<div class="empty">${ICON.inbox}<h4>Sin eventos en este radio</h4><p>Amplía la distancia o cambia el filtro.</p></div>`
        : list.sort((a, b) => a._dist - b._dist).map(ev => _eventCardHTML(ev)).join("");
    }
    const cnt = document.getElementById("mapCount");
    if (cnt) cnt.textContent = `${list.length} evento${list.length !== 1 ? "s" : ""} cerca`;
    // re-aplica fade-in
    const pane = _markersLayer.getPane ? null : null;
    const cont = document.querySelector(".leaflet-marker-pane");
    if (cont && !skipFade) { cont.classList.remove("fading"); }
  };

  // US03: animacion de fade-out al cambiar filtros
  const cont = document.querySelector(".leaflet-marker-pane");
  if (cont && !skipFade) {
    cont.classList.add("fading");
    setTimeout(paint, 180);
  } else {
    paint();
  }
}

function _eventCardHTML(ev) {
  const fav = EL.store.session.role === "asistente" && EL.store.isFavorite(ev.id);
  const thumb = ev.imgUrl ? `background:url(${ev.imgUrl}) center/cover` : `background:${ev.img}`;
  return `
    <div class="ev-card" role="button" tabindex="0" aria-label="Ver detalle de ${ev.name}"
         onclick="EL.openEvent(${ev.id})" onkeydown="EL.kAct(event, ()=>EL.openEvent(${ev.id}))">
      <div class="ev-thumb" style="${thumb}"><span class="cat">${ev.category}</span>${fav ? `<span class="ev-fav" aria-hidden="true">${ICON.heart}</span>` : ""}</div>
      <div class="ev-body">
        <h4>${ev.name}</h4>
        <div class="ev-meta">
          <span>${ev._dist != null ? ev._dist.toFixed(1) + " km" : "–"}</span>
          <span>·</span>
          <span>${ev.time}</span>
          <span>·</span>
          ${ev.verified ? `<span class="verified">${ICON.check} Verificado</span>` : `<span class="unverified">Sin verificar</span>`}
        </div>
      </div>
    </div>`;
}

Views = (typeof Views === "undefined") ? {} : Views;

Views.mapa = function (shell) {
  const role = EL.store.session.role;

  // US28: al entrar como asistente con intereses, prefiltra por ellos (1a vez)
  if (role === "asistente" && !_interestPrefilled && EL.store.userInterests.length) {
    _filterCategories = EL.store.userInterests.slice();
    _interestPrefilled = true;
  }

  const needGps = _gpsMode === null;
  shell.innerHTML = `
    <div class="view-head">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
        <div><h2>Mapa de eventos</h2><p id="mapCount">Cargando eventos cerca de ti…</p></div>
        <div class="view-toggle" role="tablist" aria-label="Cambiar vista">
          <button class="vt ${_viewMode === "mapa" ? "active" : ""}" role="tab" aria-selected="${_viewMode === "mapa"}" onclick="Views._setViewMode('mapa')">${ICON.pin} Mapa</button>
          <button class="vt ${_viewMode === "lista" ? "active" : ""}" role="tab" aria-selected="${_viewMode === "lista"}" onclick="Views._setViewMode('lista')">${ICON.inbox} Lista</button>
        </div>
      </div>
    </div>

    ${needGps ? `
    <div class="gps-banner" id="gpsBanner">
      <div>${ICON.mapPin}<span>Para mostrarte lo que pasa a tu alrededor necesitamos tu ubicación.</span></div>
      <div class="gps-actions">
        <button class="btn btn-primary btn-sm" onclick="Views._useGps()">Usar mi ubicación</button>
        <button class="btn btn-outline btn-sm" onclick="Views._chooseDistrict()">Elegir distrito</button>
      </div>
      <div id="districtPick" style="display:none;width:100%;margin-top:10px;">
        <label for="districtSel" class="sr-only">Selecciona tu distrito</label>
        <select id="districtSel" onchange="Views._setDistrict(this.value)">
          <option value="">Selecciona tu distrito…</option>
          ${DISTRICTS.map((d, i) => `<option value="${i}">${d[0]}</option>`).join("")}
        </select>
      </div>
    </div>` : ""}

    ${EL.store.userInterests.length && _filterCategories.length ? `
    <div class="interest-note" id="interestNote">
      <span>${ICON.target} Filtrado por tus intereses</span>
      <button class="link-btn" onclick="Views._clearFilters()">Ver todos</button>
    </div>` : ""}

    <div class="panel" id="mapPanel" style="margin-bottom:18px;${_viewMode === "lista" ? "display:none;" : ""}">
      <div class="map-toolbar">
        <div class="slider-wrap">
          <label for="radiusRange">Distancia</label>
          <input type="range" id="radiusRange" min="1" max="15" value="${_filterRadius}" aria-label="Radio de búsqueda en kilómetros" />
          <span><b id="radiusVal">${_filterRadius}</b> km</span>
        </div>
        <div class="chips" id="catChips" role="group" aria-label="Filtrar por categoría"></div>
      </div>
      <div id="leafmap"></div>
    </div>

    <div class="ev-grid" id="mapEventList"></div>
  `;

  // chips multi-seleccion (US03) — incluye "Deporte"
  const cats = ["Música", "Arte", "Gastronomía", "Deporte", "Gaming", "K-pop"];
  const chipsEl = document.getElementById("catChips");
  const renderChips = () => {
    const allActive = _filterCategories.length === 0;
    chipsEl.innerHTML =
      `<button class="chip ${allActive ? "active" : ""}" aria-pressed="${allActive}" data-cat="__all">Todos</button>` +
      cats.map(c => {
        const on = _filterCategories.includes(c);
        return `<button class="chip ${on ? "active" : ""}" aria-pressed="${on}" data-cat="${c}">${c}</button>`;
      }).join("");
    chipsEl.querySelectorAll(".chip").forEach(ch => {
      ch.onclick = () => {
        const c = ch.dataset.cat;
        if (c === "__all") { _filterCategories = []; }
        else {
          const i = _filterCategories.indexOf(c);
          if (i >= 0) _filterCategories.splice(i, 1); else _filterCategories.push(c);
        }
        renderChips();
        refreshMapMarkers();
        const note = document.getElementById("interestNote"); if (note) note.style.display = "none";
      };
    });
  };
  renderChips();

  const range = document.getElementById("radiusRange");
  range.oninput = () => {
    _filterRadius = parseInt(range.value, 10);
    document.getElementById("radiusVal").textContent = _filterRadius;
    if (_radiusCircle) _radiusCircle.setRadius(_filterRadius * 1000);
    refreshMapMarkers(true);
  };
  // US02: toast confirmando el cambio al soltar el slider
  range.onchange = () => EL.toast(`Radio actualizado a ${_filterRadius} km`);

  if (_viewMode === "mapa") setTimeout(() => initLeaflet(), 60);
  else refreshMapMarkers(true); // en modo lista solo pinta tarjetas
  EL.closeBurger();
  window.scrollTo(0, 0);
};

Views._setViewMode = function (mode) {
  _viewMode = mode;
  Views.mapa(document.getElementById("appShell"));
  if (EL.store.session.role === "asistente") maybeProximityAlert();
};
Views._clearFilters = function () { _filterCategories = []; Views.mapa(document.getElementById("appShell")); };
Views._useGps = function () {
  // simula concesion de permiso GPS (US01 Escenario 1)
  _gpsMode = "gps"; USER_POS = USER_POS_DEFAULT.slice();
  EL.toast("Ubicación activada");
  Views.mapa(document.getElementById("appShell"));
  if (EL.store.session.role === "asistente") maybeProximityAlert();
};
Views._chooseDistrict = function () { document.getElementById("districtPick").style.display = "block"; };
Views._setDistrict = function (idx) {
  if (idx === "") return;
  const d = DISTRICTS[+idx];
  _gpsMode = "district"; USER_POS = [d[1], d[2]];
  EL.toast(`Mostrando eventos en ${d[0]}`);
  Views.mapa(document.getElementById("appShell"));
};

function initLeaflet() {
  const el = document.getElementById("leafmap");
  if (!el) return;
  if (_map) { _map.remove(); _map = null; }

  _map = L.map(el, { zoomControl: true, scrollWheelZoom: true }).setView(USER_POS, 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(_map);

  // marcador del usuario (US01) con pulso
  _userMarker = L.marker(USER_POS, { icon: L.divIcon({ className: "", html: '<div class="me-marker"><span class="me-pulse"></span></div>', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(_map);
  _userMarker.bindPopup('<div class="lp-title">Tu ubicación</div>');
  // circulo de radio (US02)
  _radiusCircle = L.circle(USER_POS, { radius: _filterRadius * 1000, color: "#14C4D9", weight: 1, fillColor: "#14C4D9", fillOpacity: .07 }).addTo(_map);

  _markersLayer = L.layerGroup().addTo(_map);
  refreshMapMarkers(true);
  setTimeout(() => _map.invalidateSize(), 120);
}

// Aviso por proximidad (US06): 500 m + coincidencia con intereses.
// Si el asistente no configuro intereses -> aviso promocional (Escenario 2).
function maybeProximityAlert() {
  if (EL.store.session.role !== "asistente") return;
  const interests = EL.store.userInterests;
  if (!interests.length) {
    // Escenario 2: hay un evento verificado cerca pero sin intereses configurados
    const anyNear = EL.store.activeEvents().some(e => e.verified && _distKm(USER_POS, [e.lat, e.lng]) <= 0.5);
    if (anyNear) setTimeout(() => EL.proximity({ promo: true }), 2600);
    return;
  }
  // Escenario 1: dentro de 500 m, verificado y de una categoria de interes
  const near = EL.store.activeEvents()
    .map(e => ({ ...e, distKm: +_distKm(USER_POS, [e.lat, e.lng]).toFixed(2) }))
    .filter(e => e.verified && e.distKm <= 0.5 && interests.includes(e.category))
    .sort((a, b) => a.distKm - b.distKm)[0];
  if (near) {
    setTimeout(() => {
      EL.proximity(near);
      const n = EL.store.addNotification({ icon: ICON.bell, title: "Evento de tu interés cerca", body: `${near.name} a ${near.distKm} km`, eventId: near.id });
      EL.renderNotifBell();
    }, 2600);
  }
}
