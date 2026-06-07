/* ============================================================ */
/* BLOQUE A                                                     */
/* map.js -> Mapa interactivo de eventos                        */
/* US01 (mapa), US02 (radio), US03 (filtros), US04 (ficha),     */
/* US05 (sello verificado).                                     */
/* ESTE ARCHIVO ES EJEMPLO COMPLETO PARA LOS DEMAS BLOQUES.     */
/* Muestra: datos en memoria + render + interaccion + filtros.  */
/* ============================================================ */

// 1) DATOS SIMULADOS EN MEMORIA (al recargar se reinician) -----
const eventos = [
  { id: 1, nombre: "Feria de arte urbano",  categoria: "arte",        distancia: 0.8, aforo: "60%",  verificado: true,  x: 28, y: 35 },
  { id: 2, nombre: "Concierto indie",        categoria: "musica",      distancia: 1.2, aforo: "85%",  verificado: true,  x: 62, y: 22 },
  { id: 3, nombre: "Torneo gaming",          categoria: "gaming",      distancia: 2.1, aforo: "40%",  verificado: false, x: 45, y: 68 },
  { id: 4, nombre: "Feria gastronómica",     categoria: "gastronomia", distancia: 0.5, aforo: "95%",  verificado: true,  x: 75, y: 52 },
  { id: 5, nombre: "Exposición fotográfica", categoria: "arte",        distancia: 3.5, aforo: "30%",  verificado: true,  x: 18, y: 60 },
  { id: 6, nombre: "Festival K-pop",         categoria: "musica",      distancia: 6.0, aforo: "70%",  verificado: false, x: 85, y: 80 },
];

// Estado de los filtros (US02 radio, US03 categoria)
let filtroRadio = 5;
let filtroCategoria = "todos";

// 2) RENDER del mapa con pines (US01) ---------------------------
function renderMap() {
  const mapa = document.getElementById("mapContainer");
  if (!mapa) return;
  mapa.innerHTML = "";

  // Marcador del usuario en el centro
  const usuario = document.createElement("div");
  usuario.title = "Tu ubicación";
  usuario.style.cssText = "position:absolute;left:50%;top:50%;width:20px;height:20px;background:var(--electric-cyan);border:3px solid white;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 8px rgba(17,184,201,0.2);";
  mapa.appendChild(usuario);

  // Pines de los eventos que pasan el filtro
  eventosFiltrados().forEach((ev) => {
    const pin = document.createElement("button");
    pin.textContent = ev.verificado ? "✅" : "📍";
    pin.title = ev.nombre;
    pin.style.cssText = `position:absolute;left:${ev.x}%;top:${ev.y}%;border:none;background:transparent;font-size:26px;cursor:pointer;transform:translate(-50%,-50%);transition:transform .15s;`;
    pin.addEventListener("mouseover", () => pin.style.transform = "translate(-50%,-50%) scale(1.3)");
    pin.addEventListener("mouseout", () => pin.style.transform = "translate(-50%,-50%) scale(1)");
    pin.addEventListener("click", () => abrirFicha(ev)); // US04
    mapa.appendChild(pin);
  });

  renderEventList();
}

// Devuelve eventos segun filtros activos (US02 + US03)
function eventosFiltrados() {
  return eventos.filter((ev) => {
    const pasaRadio = ev.distancia <= filtroRadio;
    const pasaCat = filtroCategoria === "todos" || ev.categoria === filtroCategoria;
    return pasaRadio && pasaCat;
  });
}

// 3) Lista de eventos debajo del mapa --------------------------
function renderEventList() {
  const lista = document.getElementById("eventsList");
  if (!lista) return;
  const items = eventosFiltrados();
  if (items.length === 0) {
    lista.innerHTML = "<p style='color:var(--slate-grey);'>No hay eventos en este radio. Amplía la búsqueda.</p>";
    return;
  }
  lista.innerHTML = items.map((ev) => `
    <div class="card" style="cursor:pointer;padding:18px;" onclick='abrirFichaPorId(${ev.id})'>
      <h3 style="font-size:16px;">${ev.nombre} ${ev.verificado ? "<span style='color:var(--success-green);font-size:13px;'>✓ Verificado</span>" : ""}</h3>
      <p style="font-size:13px;margin-top:6px;">📍 ${ev.distancia} km · Aforo ${ev.aforo}</p>
    </div>
  `).join("");
}

// 4) Ficha de detalle del evento (US04 + sello US05) -----------
function abrirFicha(ev) {
  const sello = ev.verificado
    ? "✅ Verificado por Geofencing"
    : "⚠ Información no verificada";
  showToast(`${ev.nombre} — ${ev.distancia} km — Aforo ${ev.aforo} — ${sello}`);
  // En una version mas completa, aqui se abriria un modal con todos los detalles.
}
function abrirFichaPorId(id) {
  const ev = eventos.find((e) => e.id === id);
  if (ev) abrirFicha(ev);
}

// 5) Conexion de los filtros (US02 slider + US03 chips) --------
function initMapFilters() {
  const slider = document.getElementById("radiusSlider");
  const radiusValue = document.getElementById("radiusValue");
  if (slider) {
    slider.addEventListener("input", () => {
      filtroRadio = parseInt(slider.value, 10);
      radiusValue.textContent = filtroRadio;
      renderMap();
    });
  }
  document.querySelectorAll("#categoryChips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#categoryChips .chip").forEach((c) => c.classList.remove("chip--active"));
      chip.classList.add("chip--active");
      filtroCategoria = chip.dataset.cat;
      renderMap();
    });
  });
}

// 6) Inicializa cuando el usuario entra al mapa ----------------
// (se llama cada vez que se entra a la app; revisa que el contenedor exista)
document.addEventListener("DOMContentLoaded", () => {
  // pequeno retardo para asegurar que el DOM de la app este disponible
  const observer = new MutationObserver(() => {
    const mapa = document.getElementById("mapContainer");
    if (mapa && mapa.childElementCount === 0 && document.getElementById("appSite").style.display !== "none") {
      initMapFilters();
      renderMap();
    }
  });
  observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["style"] });
});
