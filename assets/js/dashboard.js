/* ============================================================ */
/* BLOQUE A                                                     */
/* dashboard.js -> Dashboard de IA Predictiva                   */
/* US21 (prediccion de Booms), US23 (alertas predictivas).      */
/* EJEMPLO de "simulacion creible" que pide el statement:       */
/* un boton dispara una prediccion simulada con resultado.      */
/* ============================================================ */

// Resultados simulados de prediccion (en memoria)
const predicciones = [
  { zona: "Barranco",   demanda: 87, categoria: "Música en vivo",     ventana: "Hoy 8:00 PM - 11:00 PM" },
  { zona: "Miraflores", demanda: 73, categoria: "Feria gastronómica", ventana: "Mañana 12:00 PM - 4:00 PM" },
  { zona: "Chorrillos", demanda: 65, categoria: "Arte urbano",        ventana: "Sábado 5:00 PM - 9:00 PM" },
];

function initDashboard() {
  const btn = document.getElementById("predictBtn");
  const result = document.getElementById("predictionResult");
  if (!btn || btn.dataset.ready) return;
  btn.dataset.ready = "true"; // evita conectar el evento dos veces

  btn.addEventListener("click", () => {
    // Estado "procesando" (US visibilidad del estado del sistema)
    result.innerHTML = "<p style='color:var(--slate-grey);'>⏳ Analizando tendencias de las últimas 4 horas...</p>";

    // Simula proceso de IA con un retardo (sensacion real)
    setTimeout(() => {
      let html = "<h3 style='color:var(--midnight-navy);margin-bottom:12px;'>Booms culturales detectados</h3>";
      predicciones.forEach((p) => {
        html += `
          <div style="background:var(--sky-mist);margin:10px 0;padding:16px;border-radius:12px;border-left:4px solid var(--electric-cyan);">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong style="color:var(--midnight-navy);">${p.zona}</strong>
              <span style="background:var(--lime-volt);color:var(--midnight-navy);padding:3px 10px;border-radius:12px;font-weight:800;font-size:13px;">${p.demanda}% demanda</span>
            </div>
            <p style="font-size:14px;margin-top:6px;color:var(--charcoal-navy);">Categoría: ${p.categoria}</p>
            <p style="font-size:13px;color:var(--slate-grey);">Ventana óptima: ${p.ventana}</p>
          </div>`;
      });
      html += "<p style='font-size:12px;color:var(--slate-grey);margin-top:10px;'>* Predicción simulada para fines de demostración.</p>";
      result.innerHTML = html;
      showToast("Predicción generada con éxito");
    }, 1200);
  });
}

// Conecta el dashboard cuando aparece en el DOM
document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    if (document.getElementById("predictBtn")) initDashboard();
  });
  observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["style"] });
});
