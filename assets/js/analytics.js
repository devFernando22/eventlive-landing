/* ============================================================ */
/* Analitica e inteligencia de mercado                          */
/* User Stories: US22, US24, US25, US27                        */
/* US22: Análisis de ROI por evento con comparativa            */
/* ============================================================ */

// Historial de eventos finalizados del organizador (simulado en memoria)
const eventHistory = [
  { id: 1, nombre: "Concierto Indie Rock", categoria: "musica", fecha: "15/04/2026", inversion: 1200, alcance: 4800, asistencia: 340, precioEntrada: 15 },
  { id: 2, nombre: "Feria de Arte Barranco", categoria: "arte", fecha: "28/03/2026", inversion: 800, alcance: 2900, asistencia: 195, precioEntrada: 0 },
  { id: 3, nombre: "Festival Gastronómico", categoria: "gastronomia", fecha: "10/03/2026", inversion: 1500, alcance: 6200, asistencia: 480, precioEntrada: 20 },
  { id: 4, nombre: "Torneo Gaming Lima", categoria: "gaming", fecha: "22/02/2026", inversion: 600, alcance: 3100, asistencia: 220, precioEntrada: 10 },
  { id: 5, nombre: "Jazz en Miraflores", categoria: "musica", fecha: "08/02/2026", inversion: 950, alcance: 3400, asistencia: 210, precioEntrada: 18 },
  { id: 6, nombre: "Expo Fotografía Lima", categoria: "arte", fecha: "25/01/2026", inversion: 700, alcance: 2100, asistencia: 160, precioEntrada: 5 },
  { id: 7, nombre: "Noche de Cumbia Clásica", categoria: "musica", fecha: "12/01/2026", inversion: 1100, alcance: 5100, asistencia: 390, precioEntrada: 12 },
  { id: 8, nombre: "Feria Orgánica Surco", categoria: "gastronomia", fecha: "30/12/2025", inversion: 900, alcance: 3800, asistencia: 310, precioEntrada: 8 },
];

// ROI = (ingresos - inversión) / inversión × 100
function calcularROI(ev) {
  const ingresos = ev.asistencia * ev.precioEntrada;
  const roi = ((ingresos - ev.inversion) / ev.inversion) * 100; 

  return roi.toFixed(1);
}

// Render lista de eventos finalizados con botón "Ver ROI"
function renderRoiList() {
  const section = document.getElementById("roiSection");
  console.log(section);
  if (!section) return;

  const rows = eventHistory.map((ev) => {
    const roi = parseFloat(calcularROI(ev));
    const roiColor = roi >= 0 ? "var(--success-green)" : "var(--error-red)";
    const roiLabel = roi >= 0 ? `+${roi}%` : `${roi}%`;

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;background:white;border-radius:12px;padding:16px 20px;box-shadow:var(--shadow);margin-bottom:10px;flex-wrap:wrap;gap:10px;">
        <div>
          <strong style="color:var(--midnight-navy);font-size:15px;">${ev.nombre}</strong>
          <div style="font-size:13px;color:var(--slate-grey);margin-top:3px;">${ev.fecha} · <span style="text-transform:capitalize;">${ev.categoria}</span></div>
        </div>
        <div style="display:flex;align-items:center;gap:14px;">
          <span style="color:${roiColor};font-weight:800;font-size:15px;">ROI ${roiLabel}</span>
          <button class="btn btn--primary" onclick="showRoiAnalysis(${ev.id})" style="font-size:13px;padding:8px 16px;">Ver ROI</button>
        </div>
      </div>`;
  }).join("");

  section.innerHTML = `
    <div style="margin-top:40px;">
      <h3 style="color:var(--midnight-navy);font-size:22px;margin-bottom:6px;">Análisis de ROI por Evento</h3>
      <p style="color:var(--slate-grey);font-size:14px;margin-bottom:20px;">Selecciona un evento finalizado para ver su análisis completo</p>
      ${rows}
      <div id="roiAnalysisPanel"></div>
    </div>`;
}

// Render panel de análisis detallado con gráficos y comparativa
function showRoiAnalysis(eventId) {
  const ev = eventHistory.find((e) => e.id === eventId);
  if (!ev) return;

  const roi = parseFloat(calcularROI(ev));
  const ingresos = ev.asistencia * ev.precioEntrada;
  const roiColor = roi >= 0 ? "var(--success-green)" : "var(--error-red)";
  const roiBg = roi >= 0 ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)";
  const roiLabel = roi >= 0 ? `+${roi}%` : `${roi}%`;

  const similares = eventHistory.filter((e) => e.categoria === ev.categoria && e.id !== ev.id);

  const allSet = [ev, ...similares];
  const maxAlcance = Math.max(...allSet.map((e) => e.alcance));
  const maxAsistencia = Math.max(...allSet.map((e) => e.asistencia));
  const maxInversion = Math.max(...allSet.map((e) => e.inversion));

  function bar(label, value, max, color, prefix, suffix) {
    const w = Math.round((value / max) * 100);
    return `
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;">
          <span style="color:var(--charcoal-navy);font-weight:700;">${label}</span>
          <span style="color:var(--charcoal-navy);">${prefix}${value.toLocaleString("es-PE")}${suffix}</span>
        </div>
        <div style="height:12px;background:#E2E8F0;border-radius:6px;overflow:hidden;">
          <div style="height:100%;width:${w}%;background:${color};border-radius:6px;"></div>
        </div>
      </div>`;
  }

  const comparativaRows = similares.length > 0
    ? similares.map((sim) => {
      const simRoi = parseFloat(calcularROI(sim));
      const simColor = simRoi >= 0 ? "var(--success-green)" : "var(--error-red)";
      const simLabel = simRoi >= 0 ? `+${simRoi}%` : `${simRoi}%`;
      const simAlcancePct = Math.round((sim.alcance / maxAlcance) * 100);
      const simAsistenciaPct = Math.round((sim.asistencia / maxAsistencia) * 100);
      return `
          <div style="padding:14px 0;border-bottom:1px solid #E2E8F0;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
              <div>
                <div style="font-size:14px;font-weight:700;color:var(--charcoal-navy);">${sim.nombre}</div>
                <div style="font-size:12px;color:var(--slate-grey);">${sim.fecha}</div>
              </div>
              <div style="display:flex;gap:20px;font-size:13px;text-align:right;">
                <div>
                  <div style="color:var(--slate-grey);">Inversión</div>
                  <div style="font-weight:800;color:var(--midnight-navy);">S/ ${sim.inversion.toLocaleString("es-PE")}</div>
                </div>
                <div>
                  <div style="color:var(--slate-grey);">Asistencia</div>
                  <div style="font-weight:800;color:var(--midnight-navy);">${sim.asistencia.toLocaleString("es-PE")}</div>
                </div>
                <div>
                  <div style="color:var(--slate-grey);">ROI</div>
                  <div style="font-weight:800;color:${simColor};">${simLabel}</div>
                </div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div>
                <div style="font-size:11px;color:var(--slate-grey);margin-bottom:3px;">Alcance ${sim.alcance.toLocaleString("es-PE")}</div>
                <div style="height:8px;background:#E2E8F0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:${simAlcancePct}%;background:var(--lime-volt);border-radius:4px;"></div></div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--slate-grey);margin-bottom:3px;">Asistencia ${sim.asistencia.toLocaleString("es-PE")}</div>
                <div style="height:8px;background:#E2E8F0;border-radius:4px;overflow:hidden;"><div style="height:100%;width:${simAsistenciaPct}%;background:var(--electric-cyan);border-radius:4px;"></div></div>
              </div>
            </div>
          </div>`;
    }).join("")
    : "<p style='color:var(--slate-grey);font-size:14px;padding:10px 0;'>No hay eventos de categoría similar para comparar.</p>";

  const panel = document.getElementById("roiAnalysisPanel");
  if (!panel) return;

  panel.innerHTML = `
    <div style="margin-top:24px;background:white;border-radius:var(--radius-lg);padding:32px;box-shadow:var(--shadow-lg);border-top:4px solid var(--electric-cyan);">

      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:28px;">
        <div>
          <h4 style="color:var(--midnight-navy);font-size:20px;margin-bottom:4px;">${ev.nombre}</h4>
          <p style="color:var(--slate-grey);font-size:14px;">${ev.fecha} · Categoría: <span style="text-transform:capitalize;">${ev.categoria}</span></p>
        </div>
        <div style="background:${roiBg};border:2px solid ${roiColor};border-radius:12px;padding:14px 22px;text-align:center;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:${roiColor};font-weight:700;margin-bottom:4px;">ROI Total</div>
          <div style="font-size:30px;font-weight:800;color:${roiColor};">${roiLabel}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-bottom:28px;">
        <div style="background:var(--sky-mist);border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;text-transform:uppercase;color:var(--slate-grey);letter-spacing:.5px;margin-bottom:6px;">Inversión</div>
          <div style="font-size:22px;font-weight:800;color:var(--midnight-navy);">S/ ${ev.inversion.toLocaleString("es-PE")}</div>
        </div>
        <div style="background:var(--sky-mist);border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;text-transform:uppercase;color:var(--slate-grey);letter-spacing:.5px;margin-bottom:6px;">Alcance Total</div>
          <div style="font-size:22px;font-weight:800;color:var(--electric-cyan);">${ev.alcance.toLocaleString("es-PE")}</div>
        </div>
        <div style="background:var(--sky-mist);border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;text-transform:uppercase;color:var(--slate-grey);letter-spacing:.5px;margin-bottom:6px;">Asistencia</div>
          <div style="font-size:22px;font-weight:800;color:var(--midnight-navy);">${ev.asistencia.toLocaleString("es-PE")}</div>
        </div>
        <div style="background:var(--sky-mist);border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;text-transform:uppercase;color:var(--slate-grey);letter-spacing:.5px;margin-bottom:6px;">Ingresos</div>
          <div style="font-size:22px;font-weight:800;color:var(--success-green);">S/ ${ingresos.toLocaleString("es-PE")}</div>
        </div>
      </div>

      <div style="margin-bottom:28px;">
        <h5 style="color:var(--midnight-navy);font-size:15px;margin-bottom:16px;">Métricas del evento</h5>
        ${bar("Inversión publicitaria", ev.inversion, maxInversion, "var(--electric-cyan)", "S/ ", "")}
        ${bar("Alcance total", ev.alcance, maxAlcance, "var(--lime-volt)", "", " personas")}
        ${bar("Asistencia verificada", ev.asistencia, maxAsistencia, "var(--midnight-navy)", "", " personas")}
      </div>

      <div>
        <h5 style="color:var(--midnight-navy);font-size:15px;margin-bottom:4px;">Comparativa — Eventos similares <span style="text-transform:capitalize;">(${ev.categoria})</span></h5>
        <p style="font-size:13px;color:var(--slate-grey);margin-bottom:12px;">Las barras están normalizadas respecto al mejor resultado del grupo</p>
        ${comparativaRows}
      </div>

      <p style="font-size:12px;color:var(--slate-grey);margin-top:16px;">* Datos simulados para fines de demostración. ROI = (Ingresos − Inversión) / Inversión × 100.</p>
    </div>`;

  panel.scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(`Análisis ROI cargado: ${ev.nombre}`);
}

function initAnalytics() {
  const section = document.getElementById("roiSection");
  if (!section || section.dataset.ready) return;
  section.dataset.ready = "true";
  renderRoiList();
  renderDaasPanel();
  renderBenchmarkPanel();
}

document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    const dash = document.getElementById("view-dashboard");
    // if (dash && dash.style.display !== "none") initAnalytics();
    initAnalytics();
  });
  observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["style"] });
});

/* ============================================================ */
/* US24 - Exportar reporte DaaS de inteligencia de movilidad   */
/* ============================================================ */

const daasZoneData = {
  "Barranco": {
    movilidad: { flujo: 12400, horaPico: "20:00–22:00", densidad: "Alta", eventos: 8, incremento: "+23%", categorias: ["Música en vivo", "Arte urbano", "Gastronomía"] },
    consumo: { gastoPromedio: 85, asistentes: 4800, topEvento: "Noche de Jazz – Barranco", nps: 92 },
    proyecciones: { demanda30d: "+18%", eventosEsperados: 34, confianza: 88, boomAlert: true },
  },
  "Miraflores": {
    movilidad: { flujo: 18700, horaPico: "12:00–14:00", densidad: "Muy Alta", eventos: 12, incremento: "+15%", categorias: ["Gastronomía", "Arte", "Bienestar"] },
    consumo: { gastoPromedio: 120, asistentes: 7200, topEvento: "Feria Gastronómica – El Parque", nps: 88 },
    proyecciones: { demanda30d: "+12%", eventosEsperados: 48, confianza: 91, boomAlert: false },
  },
  "Chorrillos": {
    movilidad: { flujo: 7300, horaPico: "18:00–20:00", densidad: "Media", eventos: 5, incremento: "+31%", categorias: ["Gaming", "Música", "Deporte"] },
    consumo: { gastoPromedio: 45, asistentes: 2100, topEvento: "Torneo Gaming Lima Sur", nps: 85 },
    proyecciones: { demanda30d: "+28%", eventosEsperados: 18, confianza: 79, boomAlert: true },
  },
  "San Isidro": {
    movilidad: { flujo: 21000, horaPico: "13:00–15:00", densidad: "Muy Alta", eventos: 6, incremento: "+8%", categorias: ["Bienestar", "Gastronomía", "Arte"] },
    consumo: { gastoPromedio: 180, asistentes: 5600, topEvento: "Expo Arte Corporativo", nps: 90 },
    proyecciones: { demanda30d: "+9%", eventosEsperados: 22, confianza: 94, boomAlert: false },
  },
  "Surco": {
    movilidad: { flujo: 9800, horaPico: "19:00–21:00", densidad: "Media-Alta", eventos: 7, incremento: "+19%", categorias: ["Gastronomía", "Gaming", "Música"] },
    consumo: { gastoPromedio: 70, asistentes: 3400, topEvento: "Festival Orgánico Surco", nps: 87 },
    proyecciones: { demanda30d: "+21%", eventosEsperados: 28, confianza: 82, boomAlert: false },
  },
};

// Reports available for 30 days (in-memory store)
const daasReportHistory = [];

function renderDaasPanel() {
  const container = document.getElementById("daasSection");
  if (!container || container.dataset.ready) return;
  container.dataset.ready = "true";

  container.innerHTML = `
    <div style="margin-top:48px;">
      <h3 style="color:var(--midnight-navy);font-size:22px;margin-bottom:4px;">Reportes DaaS – Inteligencia de Movilidad</h3>
      <p style="color:var(--slate-grey);font-size:14px;margin-bottom:24px;">Genera reportes auditables por zona y rango de fechas para sustentar decisiones estratégicas.</p>

      <div style="background:white;border-radius:var(--radius-lg);padding:32px;box-shadow:var(--shadow);border-top:4px solid var(--lime-volt);">
        <form id="daasForm">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:24px;">

            <div>
              <label style="display:block;font-size:13px;font-weight:700;color:var(--charcoal-navy);margin-bottom:8px;">Zona geográfica</label>
              <select id="daasZone" style="width:100%;padding:10px 14px;border:1.5px solid #CBD5E1;border-radius:10px;font-family:var(--font-body);font-size:14px;color:var(--charcoal-navy);background:white;">
                <option value="">Seleccionar zona…</option>
                <option value="Barranco">Barranco</option>
                <option value="Miraflores">Miraflores</option>
                <option value="Chorrillos">Chorrillos</option>
                <option value="San Isidro">San Isidro</option>
                <option value="Surco">Surco</option>
              </select>
            </div>

            <div>
              <label style="display:block;font-size:13px;font-weight:700;color:var(--charcoal-navy);margin-bottom:8px;">Fecha inicio</label>
              <input type="date" id="daasDateFrom" style="width:100%;padding:10px 14px;border:1.5px solid #CBD5E1;border-radius:10px;font-family:var(--font-body);font-size:14px;color:var(--charcoal-navy);" />
            </div>

            <div>
              <label style="display:block;font-size:13px;font-weight:700;color:var(--charcoal-navy);margin-bottom:8px;">Fecha fin</label>
              <input type="date" id="daasDateTo" style="width:100%;padding:10px 14px;border:1.5px solid #CBD5E1;border-radius:10px;font-family:var(--font-body);font-size:14px;color:var(--charcoal-navy);" />
            </div>

            <div>
              <label style="display:block;font-size:13px;font-weight:700;color:var(--charcoal-navy);margin-bottom:8px;">Tipo de reporte</label>
              <select id="daasType" style="width:100%;padding:10px 14px;border:1.5px solid #CBD5E1;border-radius:10px;font-family:var(--font-body);font-size:14px;color:var(--charcoal-navy);background:white;">
                <option value="">Seleccionar tipo…</option>
                <option value="movilidad">Movilidad urbana</option>
                <option value="consumo">Consumo cultural</option>
                <option value="proyecciones">Proyecciones estratégicas</option>
              </select>
            </div>

          </div>

          <p id="daasFormError" style="color:var(--error-red);font-size:13px;margin-bottom:12px;min-height:18px;"></p>
          <button type="submit" class="btn btn--accent btn--lg" id="daasGenerateBtn">Generar reporte PDF</button>
        </form>
      </div>

      <div id="daasProgress" style="display:none;margin-top:20px;background:white;border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);text-align:center;">
        <p style="color:var(--slate-grey);font-size:15px;">⏳ Compilando datos de movilidad y validando métricas…</p>
        <div style="height:6px;background:#E2E8F0;border-radius:3px;margin-top:16px;overflow:hidden;">
          <div id="daasProgressBar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--electric-cyan),var(--lime-volt));border-radius:3px;transition:width .4s ease;"></div>
        </div>
      </div>

      <div id="daasResult"></div>

      <div id="daasHistory" style="margin-top:32px;"></div>
    </div>`;

  document.getElementById("daasForm").addEventListener("submit", handleDaasGenerate);
  renderDaasHistory();
}

function handleDaasGenerate(e) {
  e.preventDefault();
  const zone = document.getElementById("daasZone").value;
  const dateFrom = document.getElementById("daasDateFrom").value;
  const dateTo = document.getElementById("daasDateTo").value;
  const type = document.getElementById("daasType").value;
  const errorEl = document.getElementById("daasFormError");

  if (!zone || !dateFrom || !dateTo || !type) {
    errorEl.textContent = "Completa todos los campos para generar el reporte.";
    return;
  }
  if (dateFrom > dateTo) {
    errorEl.textContent = "La fecha de inicio debe ser anterior a la fecha fin.";
    return;
  }
  errorEl.textContent = "";

  const progress = document.getElementById("daasProgress");
  const result = document.getElementById("daasResult");
  const btn = document.getElementById("daasGenerateBtn");

  btn.disabled = true;
  btn.textContent = "Generando…";
  result.innerHTML = "";
  progress.style.display = "block";

  let pct = 0;
  const bar = document.getElementById("daasProgressBar");
  const fill = setInterval(() => {
    pct = Math.min(pct + Math.random() * 18, 90);
    bar.style.width = pct + "%";
  }, 280);

  setTimeout(() => {
    clearInterval(fill);
    bar.style.width = "100%";

    setTimeout(() => {
      progress.style.display = "none";
      btn.disabled = false;
      btn.textContent = "Generar reporte PDF";

      const reportId = "RPT-" + Date.now().toString(36).toUpperCase();
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      const expiryStr = expiry.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });

      const reportData = { reportId, zone, dateFrom, dateTo, type, expiry: expiryStr, generatedAt: new Date().toLocaleString("es-PE") };
      daasReportHistory.unshift(reportData);

      renderDaasResult(reportData);
      renderDaasHistory();
      showToast(`Reporte ${reportId} generado — disponible 30 días`);
    }, 350);
  }, 2200);
}

function renderDaasResult(rd) {
  const zd = daasZoneData[rd.zone] || daasZoneData["Miraflores"];
  const typeLabels = { movilidad: "Movilidad urbana", consumo: "Consumo cultural", proyecciones: "Proyecciones estratégicas" };
  const result = document.getElementById("daasResult");

  const sections = buildReportSections(rd.type, zd, rd.zone);

  result.innerHTML = `
    <div style="margin-top:24px;background:white;border-radius:var(--radius-lg);padding:32px;box-shadow:var(--shadow-lg);border-top:4px solid var(--electric-cyan);">

      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:28px;">
        <div>
          <div style="display:inline-block;background:var(--sky-mist);color:var(--electric-cyan);font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:10px;">Reporte DaaS Auditable</div>
          <h4 style="color:var(--midnight-navy);font-size:20px;margin-bottom:4px;">${typeLabels[rd.type]} — ${rd.zone}</h4>
          <p style="color:var(--slate-grey);font-size:13px;">Período: ${formatDate(rd.dateFrom)} al ${formatDate(rd.dateTo)}</p>
          <p style="color:var(--slate-grey);font-size:12px;margin-top:4px;">ID: <code style="background:#F1F5F9;padding:2px 6px;border-radius:4px;">${rd.reportId}</code> · Generado: ${rd.generatedAt}</p>
        </div>
        <div style="text-align:right;">
          <button class="btn btn--primary" onclick="downloadDaasReport('${rd.reportId}')" style="margin-bottom:8px;">Descargar PDF</button>
          <div style="font-size:12px;color:var(--slate-grey);">Disponible hasta: <strong style="color:var(--midnight-navy);">${rd.expiry}</strong></div>
        </div>
      </div>

      ${sections}

      <p style="font-size:12px;color:var(--slate-grey);margin-top:24px;border-top:1px solid #E2E8F0;padding-top:12px;">* Datos simulados con fines de demostración académica. En producción, las métricas provienen de GPS anonimizados y sensores IoT de la plataforma EventLive.</p>
    </div>`;

  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildReportSections(type, zd, zone) {
  const pill = (label, color) => `<span style="display:inline-block;background:${color}22;color:${color};font-size:11px;font-weight:700;padding:3px 10px;border-radius:12px;margin:2px;">${label}</span>`;

  if (type === "movilidad") {
    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-bottom:28px;">
        ${kpiCard("Flujo peatonal", zd.movilidad.flujo.toLocaleString("es-PE"), "personas/día", "var(--electric-cyan)")}
        ${kpiCard("Hora pico", zd.movilidad.horaPico, "", "var(--midnight-navy)")}
        ${kpiCard("Densidad", zd.movilidad.densidad, "", "var(--success-green)")}
        ${kpiCard("Eventos activos", zd.movilidad.eventos, "detectados", "var(--lime-volt)")}
        ${kpiCard("Incremento", zd.movilidad.incremento, "vs. mes anterior", "var(--success-green)")}
      </div>
      <div style="margin-bottom:20px;">
        <h5 style="color:var(--midnight-navy);font-size:15px;margin-bottom:12px;">Categorías predominantes en la zona</h5>
        <div>${zd.movilidad.categorias.map((c) => pill(c, "var(--electric-cyan)")).join("")}</div>
      </div>
      <div>
        <h5 style="color:var(--midnight-navy);font-size:15px;margin-bottom:12px;">Distribución horaria (simulada)</h5>
        ${hourlyBar(zone)}
      </div>`;
  }

  if (type === "consumo") {
    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-bottom:28px;">
        ${kpiCard("Asistentes únicos", zd.consumo.asistentes.toLocaleString("es-PE"), "en el período", "var(--electric-cyan)")}
        ${kpiCard("Gasto promedio", "S/ " + zd.consumo.gastoPromedio, "por asistente", "var(--success-green)")}
        ${kpiCard("NPS cultural", zd.consumo.nps + "/100", "satisfacción", "var(--midnight-navy)")}
        ${kpiCard("Ingresos est.", "S/ " + (zd.consumo.asistentes * zd.consumo.gastoPromedio).toLocaleString("es-PE"), "total zona", "var(--lime-volt)")}
      </div>
      <div style="margin-bottom:20px;">
        <h5 style="color:var(--midnight-navy);font-size:15px;margin-bottom:10px;">Evento de mayor impacto</h5>
        <div style="background:var(--sky-mist);border-radius:12px;padding:16px;border-left:4px solid var(--lime-volt);">
          <strong style="color:var(--midnight-navy);">${zd.consumo.topEvento}</strong>
          <p style="font-size:13px;color:var(--slate-grey);margin-top:4px;">Mayor concentración de asistentes verificados por geofencing en el período seleccionado.</p>
        </div>
      </div>
      <div>
        <h5 style="color:var(--midnight-navy);font-size:15px;margin-bottom:12px;">Categorías de mayor consumo</h5>
        <div>${zd.movilidad.categorias.map((c, i) => {
          const pcts = [54, 31, 15];
          return miniProgressRow(c, pcts[i] || 10, "var(--electric-cyan)");
        }).join("")}</div>
      </div>`;
  }

  // proyecciones
  const boomBg = zd.proyecciones.boomAlert ? "rgba(200,241,105,0.15)" : "rgba(220,38,38,0.08)";
  const boomColor = zd.proyecciones.boomAlert ? "var(--success-green)" : "var(--slate-grey)";
  const boomLabel = zd.proyecciones.boomAlert ? "ZONA BOOM DETECTADA" : "Sin alerta de Boom";
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-bottom:28px;">
      ${kpiCard("Demanda +30 días", zd.proyecciones.demanda30d, "proyección", "var(--electric-cyan)")}
      ${kpiCard("Eventos esperados", zd.proyecciones.eventosEsperados, "próximo mes", "var(--midnight-navy)")}
      ${kpiCard("Confianza del modelo", zd.proyecciones.confianza + "%", "índice IA", "var(--success-green)")}
    </div>
    <div style="background:${boomBg};border:1.5px solid ${boomColor};border-radius:14px;padding:20px;margin-bottom:20px;display:flex;align-items:center;gap:16px;">
      <div style="font-size:28px;">${zd.proyecciones.boomAlert ? "🚀" : "📊"}</div>
      <div>
        <div style="font-size:12px;font-weight:800;letter-spacing:.8px;color:${boomColor};text-transform:uppercase;">${boomLabel}</div>
        <p style="font-size:13px;color:var(--charcoal-navy);margin-top:4px;">
          ${zd.proyecciones.boomAlert
            ? `La IA de EventLive proyecta un incremento de demanda cultural significativo en ${zone} para las próximas 4 semanas. Se recomienda anticipar oferta de eventos y campañas de activación.`
            : `La zona muestra crecimiento estable. Se recomienda mantener presencia de marca y optimizar cobertura de eventos existentes.`}
        </p>
      </div>
    </div>
    <div>
      <h5 style="color:var(--midnight-navy);font-size:15px;margin-bottom:12px;">Proyección de flujo semanal (próximas 4 semanas)</h5>
      ${weeklyProjectionBars(zd)}
    </div>`;
}

function kpiCard(label, value, sub, color) {
  return `
    <div style="background:var(--sky-mist);border-radius:12px;padding:16px;text-align:center;">
      <div style="font-size:11px;text-transform:uppercase;color:var(--slate-grey);letter-spacing:.5px;margin-bottom:6px;">${label}</div>
      <div style="font-size:20px;font-weight:800;color:${color};">${value}</div>
      ${sub ? `<div style="font-size:11px;color:var(--slate-grey);margin-top:2px;">${sub}</div>` : ""}
    </div>`;
}

function miniProgressRow(label, pct, color) {
  return `
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
        <span style="color:var(--charcoal-navy);font-weight:700;">${label}</span>
        <span style="color:var(--slate-grey);">${pct}%</span>
      </div>
      <div style="height:10px;background:#E2E8F0;border-radius:5px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:5px;"></div>
      </div>
    </div>`;
}

function hourlyBar(zone) {
  const seed = zone.length;
  const hours = ["08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"];
  const vals = hours.map((_, i) => Math.round(30 + Math.abs(Math.sin(i + seed) * 65)));
  const max = Math.max(...vals);
  return `<div style="display:flex;align-items:flex-end;gap:6px;height:80px;">
    ${vals.map((v, i) => {
      const h = Math.round((v / max) * 72);
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="width:100%;height:${h}px;background:linear-gradient(180deg,var(--electric-cyan),var(--midnight-navy));border-radius:4px 4px 0 0;"></div>
        <span style="font-size:10px;color:var(--slate-grey);">${hours[i]}</span>
      </div>`;
    }).join("")}
  </div>`;
}

function weeklyProjectionBars(zd) {
  const base = zd.movilidad.flujo;
  const growth = parseFloat(zd.proyecciones.demanda30d) / 100;
  const weeks = [
    { label: "Semana 1", val: Math.round(base * (1 + growth * 0.2)) },
    { label: "Semana 2", val: Math.round(base * (1 + growth * 0.5)) },
    { label: "Semana 3", val: Math.round(base * (1 + growth * 0.75)) },
    { label: "Semana 4", val: Math.round(base * (1 + growth)) },
  ];
  const max = Math.max(...weeks.map((w) => w.val));
  return weeks.map((w) => {
    const pct = Math.round((w.val / max) * 100);
    return `<div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
        <span style="color:var(--charcoal-navy);font-weight:700;">${w.label}</span>
        <span style="color:var(--slate-grey);">${w.val.toLocaleString("es-PE")} personas/día</span>
      </div>
      <div style="height:10px;background:#E2E8F0;border-radius:5px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--electric-cyan),var(--lime-volt));border-radius:5px;"></div>
      </div>
    </div>`;
  }).join("");
}

function renderDaasHistory() {
  const hist = document.getElementById("daasHistory");
  if (!hist || daasReportHistory.length === 0) return;

  const typeLabels = { movilidad: "Movilidad", consumo: "Consumo cultural", proyecciones: "Proyecciones" };
  const rows = daasReportHistory.map((r) => `
    <div style="display:flex;justify-content:space-between;align-items:center;background:white;border-radius:12px;padding:16px 20px;box-shadow:var(--shadow);margin-bottom:10px;flex-wrap:wrap;gap:10px;">
      <div>
        <strong style="color:var(--midnight-navy);font-size:14px;">${typeLabels[r.type]} — ${r.zone}</strong>
        <div style="font-size:12px;color:var(--slate-grey);margin-top:2px;">${formatDate(r.dateFrom)} al ${formatDate(r.dateTo)} · ID: ${r.reportId}</div>
        <div style="font-size:11px;color:var(--slate-grey);margin-top:2px;">Expira: ${r.expiry}</div>
      </div>
      <button class="btn btn--primary" onclick="downloadDaasReport('${r.reportId}')" style="font-size:13px;padding:8px 16px;">Descargar PDF</button>
    </div>`).join("");

  hist.innerHTML = `
    <h5 style="color:var(--midnight-navy);font-size:16px;margin-bottom:12px;">Mis reportes DaaS (disponibles 30 días)</h5>
    ${rows}`;
}

function downloadDaasReport(reportId) {
  const rd = daasReportHistory.find((r) => r.reportId === reportId);
  if (!rd) return;

  const zd = daasZoneData[rd.zone] || daasZoneData["Miraflores"];
  const typeLabels = { movilidad: "Movilidad urbana", consumo: "Consumo cultural", proyecciones: "Proyecciones estratégicas" };

  const html = buildPrintableReport(rd, zd, typeLabels[rd.type]);
  const win = window.open("", "_blank", "width=860,height=700");
  if (!win) { showToast("Permite ventanas emergentes para descargar el PDF"); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
  showToast("Abriendo reporte — usa Ctrl+P para guardar como PDF");
}

function buildPrintableReport(rd, zd, typeLabel) {
  const sections = buildPrintSections(rd.type, zd, rd.zone);
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte DaaS ${rd.reportId}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:Arial,sans-serif;color:#1E293B;background:#fff;padding:40px;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #11B8C9;padding-bottom:20px;margin-bottom:28px;}
    .logo{font-size:22px;font-weight:900;color:#071B3B;}
    .logo span{color:#11B8C9;}
    .badge{display:inline-block;background:#DCEFFD;color:#11B8C9;font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;padding:4px 10px;border-radius:20px;margin-bottom:6px;}
    h1{font-size:20px;color:#071B3B;margin-bottom:4px;}
    .meta{font-size:12px;color:#64748B;}
    .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0;}
    .kpi{background:#DCEFFD;border-radius:10px;padding:14px;text-align:center;}
    .kpi-label{font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#64748B;margin-bottom:4px;}
    .kpi-value{font-size:18px;font-weight:900;color:#071B3B;}
    .kpi-sub{font-size:9px;color:#64748B;margin-top:2px;}
    .section-title{font-size:14px;font-weight:700;color:#071B3B;margin:20px 0 10px;}
    .pill{display:inline-block;background:#DCEFFD;color:#11B8C9;font-size:10px;font-weight:700;padding:3px 10px;border-radius:12px;margin:2px;}
    .bar-row{margin-bottom:8px;}
    .bar-label{display:flex;justify-content:space-between;font-size:11px;color:#1E293B;margin-bottom:3px;}
    .bar-bg{height:8px;background:#E2E8F0;border-radius:4px;overflow:hidden;}
    .bar-fill{height:100%;background:linear-gradient(90deg,#11B8C9,#C8F169);border-radius:4px;}
    .boom-box{background:#f0fdf4;border:1.5px solid #16A34A;border-radius:10px;padding:14px;margin:14px 0;}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #E2E8F0;font-size:10px;color:#64748B;display:flex;justify-content:space-between;}
    @media print{body{padding:20px;} @page{margin:1.5cm;}}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Event<span>Live</span> <span style="font-size:13px;color:#64748B;">DaaS Intelligence</span></div>
      <div style="margin-top:10px;">
        <div class="badge">Reporte DaaS Auditable</div>
        <h1>${typeLabel} — ${rd.zone}</h1>
        <p class="meta">Período: ${formatDate(rd.dateFrom)} al ${formatDate(rd.dateTo)}</p>
        <p class="meta">ID: ${rd.reportId} &nbsp;·&nbsp; Generado: ${rd.generatedAt}</p>
        <p class="meta">Disponible hasta: ${rd.expiry}</p>
      </div>
    </div>
    <div style="text-align:right;font-size:11px;color:#64748B;">
      <p>Cliente DaaS</p>
      <p style="font-weight:700;color:#071B3B;font-size:13px;">Panel de Inteligencia</p>
      <p>EventLive © 2026</p>
    </div>
  </div>

  ${sections}

  <div class="footer">
    <span>* Datos simulados para fines académicos. En producción: GPS anonimizados + sensores IoT.</span>
    <span>EventLive DaaS · ${rd.reportId}</span>
  </div>
</body>
</html>`;
}

function buildPrintSections(type, zd, zone) {
  const catPills = zd.movilidad.categorias.map((c) => `<span class="pill">${c}</span>`).join("");

  if (type === "movilidad") {
    const hours = ["08h","10h","12h","14h","16h","18h","20h","22h"];
    const seed = zone.length;
    const vals = hours.map((_, i) => Math.round(30 + Math.abs(Math.sin(i + seed) * 65)));
    const max = Math.max(...vals);
    const bars = hours.map((h, i) => {
      const pct = Math.round((vals[i] / max) * 100);
      return `<div class="bar-row"><div class="bar-label"><span>${h}</span><span>${vals[i]}%</span></div><div class="bar-bg"><div class="bar-fill" style="width:${pct}%;"></div></div></div>`;
    }).join("");
    return `
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-label">Flujo peatonal</div><div class="kpi-value">${zd.movilidad.flujo.toLocaleString("es-PE")}</div><div class="kpi-sub">personas/día</div></div>
        <div class="kpi"><div class="kpi-label">Hora pico</div><div class="kpi-value">${zd.movilidad.horaPico}</div></div>
        <div class="kpi"><div class="kpi-label">Densidad</div><div class="kpi-value">${zd.movilidad.densidad}</div></div>
        <div class="kpi"><div class="kpi-label">Eventos activos</div><div class="kpi-value">${zd.movilidad.eventos}</div><div class="kpi-sub">detectados</div></div>
      </div>
      <p class="section-title">Categorías predominantes</p>
      <div>${catPills}</div>
      <p class="section-title">Distribución horaria del flujo</p>
      ${bars}
      <p class="section-title">Variación mensual</p>
      <p style="font-size:13px;">Incremento de flujo: <strong>${zd.movilidad.incremento}</strong> respecto al mes anterior.</p>`;
  }

  if (type === "consumo") {
    const total = zd.consumo.asistentes * zd.consumo.gastoPromedio;
    const pcts = [54, 31, 15];
    const catBars = zd.movilidad.categorias.map((c, i) => `<div class="bar-row"><div class="bar-label"><span>${c}</span><span>${pcts[i]}%</span></div><div class="bar-bg"><div class="bar-fill" style="width:${pcts[i]}%;"></div></div></div>`).join("");
    return `
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-label">Asistentes únicos</div><div class="kpi-value">${zd.consumo.asistentes.toLocaleString("es-PE")}</div><div class="kpi-sub">en el período</div></div>
        <div class="kpi"><div class="kpi-label">Gasto promedio</div><div class="kpi-value">S/ ${zd.consumo.gastoPromedio}</div><div class="kpi-sub">por asistente</div></div>
        <div class="kpi"><div class="kpi-label">Ingresos est.</div><div class="kpi-value">S/ ${total.toLocaleString("es-PE")}</div><div class="kpi-sub">total zona</div></div>
        <div class="kpi"><div class="kpi-label">NPS cultural</div><div class="kpi-value">${zd.consumo.nps}/100</div><div class="kpi-sub">satisfacción</div></div>
      </div>
      <p class="section-title">Evento de mayor impacto</p>
      <div style="background:#DCEFFD;border-radius:8px;padding:12px;border-left:3px solid #C8F169;font-size:13px;">
        <strong>${zd.consumo.topEvento}</strong>
        <p style="font-size:11px;color:#64748B;margin-top:4px;">Mayor concentración de asistentes verificados por geofencing en el período.</p>
      </div>
      <p class="section-title">Categorías de mayor consumo cultural</p>
      ${catBars}`;
  }

  const growth = parseFloat(zd.proyecciones.demanda30d) / 100;
  const base = zd.movilidad.flujo;
  const weeks = [
    { label: "Semana 1", val: Math.round(base * (1 + growth * 0.2)) },
    { label: "Semana 2", val: Math.round(base * (1 + growth * 0.5)) },
    { label: "Semana 3", val: Math.round(base * (1 + growth * 0.75)) },
    { label: "Semana 4", val: Math.round(base * (1 + growth)) },
  ];
  const maxW = Math.max(...weeks.map((w) => w.val));
  const weekBars = weeks.map((w) => {
    const pct = Math.round((w.val / maxW) * 100);
    return `<div class="bar-row"><div class="bar-label"><span>${w.label}</span><span>${w.val.toLocaleString("es-PE")} personas/día</span></div><div class="bar-bg"><div class="bar-fill" style="width:${pct}%;"></div></div></div>`;
  }).join("");
  const boomText = zd.proyecciones.boomAlert
    ? "ZONA BOOM DETECTADA — Se proyecta un incremento de demanda cultural significativo. Se recomienda anticipar oferta de eventos y campañas de activación."
    : "Crecimiento estable proyectado. Se recomienda mantener presencia de marca y optimizar cobertura de eventos existentes.";
  return `
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-label">Demanda +30 días</div><div class="kpi-value">${zd.proyecciones.demanda30d}</div><div class="kpi-sub">proyección</div></div>
      <div class="kpi"><div class="kpi-label">Eventos esperados</div><div class="kpi-value">${zd.proyecciones.eventosEsperados}</div><div class="kpi-sub">próximo mes</div></div>
      <div class="kpi"><div class="kpi-label">Confianza del modelo</div><div class="kpi-value">${zd.proyecciones.confianza}%</div><div class="kpi-sub">índice IA</div></div>
    </div>
    <div class="${zd.proyecciones.boomAlert ? "boom-box" : ""}" style="${zd.proyecciones.boomAlert ? "" : "background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px;margin:14px 0;"}">
      <strong style="font-size:12px;">${zd.proyecciones.boomAlert ? "🚀 " : "📊 "}${zd.proyecciones.boomAlert ? "ALERTA BOOM" : "Estado de zona"}</strong>
      <p style="font-size:12px;margin-top:4px;">${boomText}</p>
    </div>
    <p class="section-title">Proyección de flujo semanal</p>
    ${weekBars}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "–";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

/* ============================================================ */
/* US25 - Benchmark competitivo anónimo entre organizadores     */
/* ============================================================ */

// Segment benchmarks per category: average values across anonymous organizers
const benchmarkData = {
  musica: {
    roi:          { label: "ROI promedio",           unit: "%",          org: null, avg: 42,  low: 15,  high: 110 },
    asistencia:   { label: "Asistencia por evento",  unit: "personas",   org: null, avg: 280, low: 80,  high: 520 },
    inversion:    { label: "Inversión por evento",   unit: "S/",         org: null, avg: 980, low: 400, high: 1800, prefix: true },
    alcance:      { label: "Alcance total",          unit: "personas",   org: null, avg: 4200, low: 1200, high: 7000 },
    precio:       { label: "Precio de entrada",      unit: "S/",         org: null, avg: 14,  low: 0,   high: 35,   prefix: true },
    frecuencia:   { label: "Eventos / mes",          unit: "eventos",    org: null, avg: 1.8, low: 0.5, high: 4 },
  },
  arte: {
    roi:          { label: "ROI promedio",           unit: "%",          org: null, avg: 18,  low: -20, high: 80 },
    asistencia:   { label: "Asistencia por evento",  unit: "personas",   org: null, avg: 178, low: 50,  high: 380 },
    inversion:    { label: "Inversión por evento",   unit: "S/",         org: null, avg: 750, low: 300, high: 1500, prefix: true },
    alcance:      { label: "Alcance total",          unit: "personas",   org: null, avg: 2500, low: 800, high: 5000 },
    precio:       { label: "Precio de entrada",      unit: "S/",         org: null, avg: 4,   low: 0,   high: 20,   prefix: true },
    frecuencia:   { label: "Eventos / mes",          unit: "eventos",    org: null, avg: 1.3, low: 0.3, high: 3 },
  },
  gaming: {
    roi:          { label: "ROI promedio",           unit: "%",          org: null, avg: 55,  low: 10,  high: 130 },
    asistencia:   { label: "Asistencia por evento",  unit: "personas",   org: null, avg: 205, low: 60,  high: 450 },
    inversion:    { label: "Inversión por evento",   unit: "S/",         org: null, avg: 620, low: 200, high: 1200, prefix: true },
    alcance:      { label: "Alcance total",          unit: "personas",   org: null, avg: 3100, low: 900, high: 6000 },
    precio:       { label: "Precio de entrada",      unit: "S/",         org: null, avg: 10,  low: 0,   high: 30,   prefix: true },
    frecuencia:   { label: "Eventos / mes",          unit: "eventos",    org: null, avg: 2.5, low: 1,   high: 5 },
  },
  gastronomia: {
    roi:          { label: "ROI promedio",           unit: "%",          org: null, avg: 60,  low: 20,  high: 150 },
    asistencia:   { label: "Asistencia por evento",  unit: "personas",   org: null, avg: 395, low: 100, high: 700 },
    inversion:    { label: "Inversión por evento",   unit: "S/",         org: null, avg: 1200, low: 500, high: 2500, prefix: true },
    alcance:      { label: "Alcance total",          unit: "personas",   org: null, avg: 5000, low: 1500, high: 9000 },
    precio:       { label: "Precio de entrada",      unit: "S/",         org: null, avg: 14,  low: 0,   high: 40,   prefix: true },
    frecuencia:   { label: "Eventos / mes",          unit: "eventos",    org: null, avg: 1.5, low: 0.5, high: 3.5 },
  },
};

const catLabels = { musica: "Música", arte: "Arte", gaming: "Gaming", gastronomia: "Gastronomía" };

function renderBenchmarkPanel() {
  const container = document.getElementById("benchmarkSection");
  if (!container || container.dataset.ready) return;
  container.dataset.ready = "true";

  container.innerHTML = `
    <div style="margin-top:48px;">
      <h3 style="color:var(--midnight-navy);font-size:22px;margin-bottom:4px;">Benchmark competitivo</h3>
      <p style="color:var(--slate-grey);font-size:14px;margin-bottom:24px;">Compara tu desempeño frente al promedio anónimo de organizadores de tu mismo nicho y zona.</p>

      <div style="background:white;border-radius:var(--radius-lg);padding:32px;box-shadow:var(--shadow);border-top:4px solid var(--midnight-navy);">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:24px;">
          <div>
            <label style="display:block;font-size:13px;font-weight:700;color:var(--charcoal-navy);margin-bottom:8px;">Mi categoría principal</label>
            <select id="bmCategory" style="width:100%;padding:10px 14px;border:1.5px solid #CBD5E1;border-radius:10px;font-family:var(--font-body);font-size:14px;color:var(--charcoal-navy);background:white;">
              <option value="">Seleccionar categoría…</option>
              <option value="musica">Música</option>
              <option value="arte">Arte</option>
              <option value="gaming">Gaming</option>
              <option value="gastronomia">Gastronomía</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:13px;font-weight:700;color:var(--charcoal-navy);margin-bottom:8px;">Zona de operación</label>
            <select id="bmZone" style="width:100%;padding:10px 14px;border:1.5px solid #CBD5E1;border-radius:10px;font-family:var(--font-body);font-size:14px;color:var(--charcoal-navy);background:white;">
              <option value="">Seleccionar zona…</option>
              <option value="Barranco">Barranco</option>
              <option value="Miraflores">Miraflores</option>
              <option value="Chorrillos">Chorrillos</option>
              <option value="San Isidro">San Isidro</option>
              <option value="Surco">Surco</option>
            </select>
          </div>
        </div>
        <p id="bmError" style="color:var(--error-red);font-size:13px;margin-bottom:12px;min-height:18px;"></p>
        <button class="btn btn--primary btn--lg" id="bmRunBtn" onclick="runBenchmark()">Analizar mi posición</button>
      </div>

      <div id="bmProgress" style="display:none;margin-top:20px;background:white;border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);text-align:center;">
        <p style="color:var(--slate-grey);font-size:15px;">⏳ Comparando con ${0} organizadores anónimos del segmento…</p>
        <div style="height:6px;background:#E2E8F0;border-radius:3px;margin-top:16px;overflow:hidden;">
          <div id="bmProgressBar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--midnight-navy),var(--electric-cyan));border-radius:3px;transition:width .35s ease;"></div>
        </div>
      </div>

      <div id="bmResult"></div>
    </div>`;
}

function runBenchmark() {
  const cat = document.getElementById("bmCategory").value;
  const zone = document.getElementById("bmZone").value;
  const errorEl = document.getElementById("bmError");

  if (!cat || !zone) {
    errorEl.textContent = "Selecciona categoría y zona para continuar.";
    return;
  }
  errorEl.textContent = "";

  const progress = document.getElementById("bmProgress");
  const result = document.getElementById("bmResult");
  const btn = document.getElementById("bmRunBtn");

  btn.disabled = true;
  result.innerHTML = "";
  progress.style.display = "block";

  // simulated peer count varies by category/zone
  const peerCount = { musica: 38, arte: 24, gaming: 19, gastronomia: 31 }[cat] || 20;
  progress.querySelector("p").textContent = `⏳ Comparando con ${peerCount} organizadores anónimos del segmento…`;

  let pct = 0;
  const bar = document.getElementById("bmProgressBar");
  const fill = setInterval(() => {
    pct = Math.min(pct + Math.random() * 20, 90);
    bar.style.width = pct + "%";
  }, 250);

  setTimeout(() => {
    clearInterval(fill);
    bar.style.width = "100%";
    setTimeout(() => {
      progress.style.display = "none";
      btn.disabled = false;
      renderBenchmarkResult(cat, zone, peerCount);
      showToast(`Benchmark generado — ${peerCount} organizadores de ${catLabels[cat]} en ${zone}`);
    }, 300);
  }, 2000);
}

function computeOrgMetrics(cat) {
  const filtered = eventHistory.filter((e) => e.categoria === cat);
  if (filtered.length === 0) return null;

  const count = filtered.length;
  const avgRoi = filtered.reduce((s, e) => s + parseFloat(calcularROI(e)), 0) / count;
  const avgAsist = filtered.reduce((s, e) => s + e.asistencia, 0) / count;
  const avgInv = filtered.reduce((s, e) => s + e.inversion, 0) / count;
  const avgAlc = filtered.reduce((s, e) => s + e.alcance, 0) / count;
  const avgPrecio = filtered.reduce((s, e) => s + e.precioEntrada, 0) / count;
  // eventHistory spans ~4 months → frequency per month
  const frecuencia = parseFloat((count / 4).toFixed(1));

  return { roi: avgRoi, asistencia: avgAsist, inversion: avgInv, alcance: avgAlc, precio: avgPrecio, frecuencia };
}

function renderBenchmarkResult(cat, zone, peerCount) {
  const bench = benchmarkData[cat];
  const orgRaw = computeOrgMetrics(cat);
  const result = document.getElementById("bmResult");

  // Inject computed organizer values (or fallback to plausible defaults)
  const orgMetrics = {
    roi:        orgRaw ? parseFloat(orgRaw.roi.toFixed(1))       : bench.roi.avg * 0.85,
    asistencia: orgRaw ? Math.round(orgRaw.asistencia)            : Math.round(bench.asistencia.avg * 0.9),
    inversion:  orgRaw ? Math.round(orgRaw.inversion)             : Math.round(bench.inversion.avg * 1.05),
    alcance:    orgRaw ? Math.round(orgRaw.alcance)               : Math.round(bench.alcance.avg * 0.95),
    precio:     orgRaw ? parseFloat(orgRaw.precio.toFixed(0))     : bench.precio.avg,
    frecuencia: orgRaw ? orgRaw.frecuencia                        : bench.frecuencia.avg * 0.8,
  };

  const metricKeys = ["roi", "asistencia", "inversion", "alcance", "precio", "frecuencia"];
  let aboveCount = 0;
  let belowCount = 0;

  const cards = metricKeys.map((key) => {
    const m = bench[key];
    const orgVal = orgMetrics[key];
    const avgVal = m.avg;

    // For inversion: lower is better (efficiency); for the rest higher is better
    const higherIsBetter = key !== "inversion";
    const isAbove = higherIsBetter ? orgVal >= avgVal : orgVal <= avgVal;
    const isEqual = Math.abs(orgVal - avgVal) / (avgVal || 1) < 0.05;

    if (!isEqual) isAbove ? aboveCount++ : belowCount++;

    const status = isEqual ? "Al nivel" : isAbove ? "Por encima" : "Por debajo";
    const statusColor = isEqual ? "var(--slate-grey)" : isAbove ? "var(--success-green)" : "var(--error-red)";
    const statusBg = isEqual ? "#F1F5F9" : isAbove ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.08)";
    const statusIcon = isEqual ? "➡" : isAbove ? "▲" : "▼";

    // Bar widths: normalize both values against max(high, orgVal) so both fit
    const scale = Math.max(m.high, orgVal) || 1;
    const orgPct = Math.min(Math.round((orgVal / scale) * 100), 100);
    const avgPct = Math.min(Math.round((avgVal / scale) * 100), 100);

    const fmt = (v) => {
      const rounded = key === "frecuencia" ? v.toFixed(1) : Math.round(v).toLocaleString("es-PE");
      return m.prefix ? `S/ ${rounded}` : `${rounded} ${m.unit}`;
    };

    return `
      <div style="background:white;border-radius:var(--radius);padding:22px;box-shadow:var(--shadow);border-left:4px solid ${statusColor};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--charcoal-navy);">${m.label}</div>
            <div style="font-size:12px;color:var(--slate-grey);margin-top:2px;">Segmento ${catLabels[cat]} · ${zone}</div>
          </div>
          <div style="background:${statusBg};color:${statusColor};font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;letter-spacing:.4px;">
            ${statusIcon} ${status}
          </div>
        </div>

        <div style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;">
            <span style="font-weight:700;color:var(--midnight-navy);">Tu valor</span>
            <span style="font-weight:800;color:${statusColor};">${fmt(orgVal)}</span>
          </div>
          <div style="height:12px;background:#E2E8F0;border-radius:6px;overflow:hidden;">
            <div style="height:100%;width:${orgPct}%;background:${statusColor};border-radius:6px;transition:width .5s ease;"></div>
          </div>
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;">
            <span style="color:var(--slate-grey);">Promedio del segmento</span>
            <span style="color:var(--slate-grey);">${fmt(avgVal)}</span>
          </div>
          <div style="height:8px;background:#E2E8F0;border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${avgPct}%;background:var(--slate-grey);border-radius:4px;opacity:.45;"></div>
          </div>
        </div>

        <div style="margin-top:14px;padding-top:12px;border-top:1px solid #F1F5F9;font-size:12px;color:var(--slate-grey);">
          ${buildInsightText(key, orgVal, avgVal, isAbove, isEqual, cat)}
        </div>
      </div>`;
  }).join("");

  const scoreColor = aboveCount >= belowCount ? "var(--success-green)" : "var(--error-red)";
  const scoreSummary = aboveCount >= 4
    ? "Tienes un desempeño sólido en tu nicho. Enfócate en mantener la frecuencia y optimizar márgenes."
    : aboveCount >= 2
    ? "Rendimiento mixto. Revisa los indicadores en rojo para priorizar mejoras de alto impacto."
    : "Existen oportunidades claras de mejora. Considera ajustar inversión, precio y estrategia de alcance.";

  result.innerHTML = `
    <div style="margin-top:24px;">

      <div style="background:white;border-radius:var(--radius-lg);padding:24px 28px;box-shadow:var(--shadow);margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
        <div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--slate-grey);margin-bottom:6px;">Resumen — ${catLabels[cat]} en ${zone}</div>
          <h4 style="color:var(--midnight-navy);font-size:18px;margin-bottom:4px;">${peerCount} organizadores anónimos comparados</h4>
          <p style="font-size:13px;color:var(--slate-grey);">${scoreSummary}</p>
        </div>
        <div style="display:flex;gap:20px;text-align:center;">
          <div style="background:rgba(22,163,74,0.1);border-radius:12px;padding:14px 20px;">
            <div style="font-size:26px;font-weight:800;color:var(--success-green);">${aboveCount}</div>
            <div style="font-size:11px;color:var(--success-green);font-weight:700;">Por encima</div>
          </div>
          <div style="background:rgba(220,38,38,0.08);border-radius:12px;padding:14px 20px;">
            <div style="font-size:26px;font-weight:800;color:var(--error-red);">${belowCount}</div>
            <div style="font-size:11px;color:var(--error-red);font-weight:700;">Por debajo</div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;">
        ${cards}
      </div>

      <p style="font-size:12px;color:var(--slate-grey);margin-top:20px;">* Los datos del segmento son promedios anónimos de organizadores verificados en EventLive. Los nombres e identidades de los competidores nunca se revelan.</p>
    </div>`;

  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildInsightText(key, org, avg, isAbove, isEqual, cat) {
  if (isEqual) return "Estás al nivel del promedio del segmento en esta métrica.";
  const gap = Math.abs(((org - avg) / (avg || 1)) * 100).toFixed(0);
  const tips = {
    roi:        { above: `Tu ROI supera al ${gap}% sobre el promedio. Mantén la estrategia de precios y optimiza costos fijos.`, below: `Tu ROI está un ${gap}% por debajo. Revisa la estructura de costos o ajusta el precio de entrada.` },
    asistencia: { above: `Tu convocatoria es ${gap}% superior al nicho. Buen indicador de posicionamiento de marca.`, below: `Tu asistencia está ${gap}% por debajo. Considera mejorar la difusión y los horarios de publicación.` },
    inversion:  { above: `Tu inversión está ${gap}% por debajo del promedio, lo que favorece el margen.`, below: `Inviertes ${gap}% más que el promedio. Evalúa canales de menor costo con mayor alcance.` },
    alcance:    { above: `Tu alcance supera al segmento en ${gap}%. Tu audiencia potencial es sólida.`, below: `Tu alcance está ${gap}% por debajo. Activa el módulo de comunidades y comparte eventos en redes.` },
    precio:     { above: `Tu ticket promedio es ${gap}% mayor que el nicho. Asegúrate de que el valor percibido lo justifique.`, below: `Tu precio está ${gap}% por debajo del promedio. Considera ediciones premium o entradas escalonadas.` },
    frecuencia: { above: `Publicas ${gap}% más eventos que el promedio. Mantén la calidad y evita la saturación de tu audiencia.`, below: `Tu frecuencia está ${gap}% por debajo. Más eventos aumentan el alcance acumulado y la fidelidad.` },
  };
  return (tips[key] || { above: "", below: "" })[isAbove ? "above" : "below"];
}

/* ============================================================ */
/* US27 - Configurar criterios SMART de business goals          */
/* ============================================================ */

const smartMetricDefs = {
  asistencia: { label: "Asistencia por evento",   unit: "personas", prefix: false },
  roi:        { label: "ROI promedio",             unit: "%",        prefix: false },
  eventos:    { label: "Eventos publicados",       unit: "eventos",  prefix: false },
  alcance:    { label: "Alcance total",            unit: "personas", prefix: false },
  ingresos:   { label: "Ingresos totales",         unit: "S/",       prefix: true  },
};

// Pre-loaded example goals so the dashboard is non-empty on first visit
const smartGoals = [
  {
    id: 1,
    specific:  "Aumentar la asistencia promedio a mis eventos de música en vivo a 350 personas por noche",
    metric:    "asistencia",
    target:    350,
    achievable: true,
    relevant:  "Mayor asistencia mejora la percepción de marca y los ingresos por entradas",
    deadline:  "2026-09-30",
    createdAt: "2026-04-01",
  },
  {
    id: 2,
    specific:  "Lograr un ROI promedio superior al 50% en todos los eventos del segundo semestre",
    metric:    "roi",
    target:    50,
    achievable: true,
    relevant:  "Un ROI positivo asegura la sostenibilidad económica del proyecto a largo plazo",
    deadline:  "2026-12-31",
    createdAt: "2026-04-01",
  },
];

let smartNextId = 3;

// Computes organizer's current value for a given metric from eventHistory
function getCurrentMetricValue(metric) {
  if (!eventHistory.length) return 0;
  switch (metric) {
    case "asistencia": return eventHistory.reduce((s, e) => s + e.asistencia, 0) / eventHistory.length;
    case "roi":        return eventHistory.reduce((s, e) => s + parseFloat(calcularROI(e)), 0) / eventHistory.length;
    case "eventos":    return eventHistory.length;
    case "alcance":    return eventHistory.reduce((s, e) => s + e.alcance, 0) / eventHistory.length;
    case "ingresos":   return eventHistory.reduce((s, e) => s + e.asistencia * e.precioEntrada, 0);
    default:           return 0;
  }
}

function renderSmartPanel() {
  const container = document.getElementById("smartSection");
  if (!container || container.dataset.ready) return;
  container.dataset.ready = "true";

  container.innerHTML = `
    <div style="padding:32px 24px 0;">
      <h3 style="color:var(--midnight-navy);font-size:22px;margin-bottom:4px;">Mis metas SMART</h3>
      <p style="color:var(--slate-grey);font-size:14px;margin-bottom:24px;">Define objetivos medibles y haz seguimiento de tu progreso como organizador.</p>

      <!-- SMART acronym legend -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px;">
        ${[["S","Específica","var(--electric-cyan)"],["M","Medible","var(--lime-volt)"],["A","Alcanzable","var(--success-green)"],["R","Relevante","#8B5CF6"],["T","Con tiempo","var(--midnight-navy)"]].map(([l,t,c])=>`
          <div style="display:flex;align-items:center;gap:6px;background:white;border-radius:20px;padding:6px 14px;box-shadow:var(--shadow);font-size:12px;">
            <span style="width:22px;height:22px;border-radius:50%;background:${c};color:${c==="var(--lime-volt)"?"var(--midnight-navy)":"white"};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;flex-shrink:0;">${l}</span>
            <span style="color:var(--charcoal-navy);font-weight:700;">${t}</span>
          </div>`).join("")}
      </div>

      <!-- Goal form -->
      <div style="background:white;border-radius:var(--radius-lg);padding:32px;box-shadow:var(--shadow);border-top:4px solid var(--electric-cyan);margin-bottom:32px;">
        <h4 style="color:var(--midnight-navy);font-size:17px;margin-bottom:20px;">Nueva meta SMART</h4>
        <form id="smartForm" novalidate>

          <!-- S -->
          <div style="margin-bottom:20px;">
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--charcoal-navy);margin-bottom:8px;">
              <span style="width:22px;height:22px;border-radius:50%;background:var(--electric-cyan);color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">S</span>
              Específica — ¿Qué quieres lograr exactamente?
            </label>
            <textarea id="smSpecific" rows="2" placeholder="Ej: Aumentar la asistencia promedio a 300 personas por evento en eventos de música" style="width:100%;padding:10px 14px;border:1.5px solid #CBD5E1;border-radius:10px;font-family:var(--font-body);font-size:14px;color:var(--charcoal-navy);resize:vertical;"></textarea>
            <p id="smSpecificErr" style="color:var(--error-red);font-size:11px;margin-top:4px;min-height:14px;"></p>
          </div>

          <!-- M -->
          <div style="margin-bottom:20px;">
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--charcoal-navy);margin-bottom:8px;">
              <span style="width:22px;height:22px;border-radius:50%;background:var(--lime-volt);color:var(--midnight-navy);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">M</span>
              Medible — Indicador y valor objetivo
            </label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div>
                <select id="smMetric" style="width:100%;padding:10px 14px;border:1.5px solid #CBD5E1;border-radius:10px;font-family:var(--font-body);font-size:14px;color:var(--charcoal-navy);background:white;">
                  <option value="">Seleccionar métrica…</option>
                  ${Object.entries(smartMetricDefs).map(([k,v])=>`<option value="${k}">${v.label} (${v.unit})</option>`).join("")}
                </select>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <input type="number" id="smTarget" min="1" placeholder="Valor objetivo" style="flex:1;padding:10px 14px;border:1.5px solid #CBD5E1;border-radius:10px;font-family:var(--font-body);font-size:14px;color:var(--charcoal-navy);" />
                <span id="smUnit" style="font-size:13px;color:var(--slate-grey);white-space:nowrap;min-width:40px;"></span>
              </div>
            </div>
            <p id="smMetricErr" style="color:var(--error-red);font-size:11px;margin-top:4px;min-height:14px;"></p>
          </div>

          <!-- A -->
          <div style="margin-bottom:20px;">
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--charcoal-navy);margin-bottom:8px;">
              <span style="width:22px;height:22px;border-radius:50%;background:var(--success-green);color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">A</span>
              Alcanzable — ¿Es realista con tus recursos actuales?
            </label>
            <div style="display:flex;gap:16px;">
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;">
                <input type="radio" name="smAchievable" id="smAchYes" value="yes" style="accent-color:var(--success-green);" /> Sí, es alcanzable
              </label>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;">
                <input type="radio" name="smAchievable" id="smAchNo" value="no" style="accent-color:var(--error-red);" /> Necesito ajustarla
              </label>
            </div>
            <div id="smAchWarning" style="display:none;margin-top:8px;background:rgba(220,38,38,0.08);border:1px solid var(--error-red);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--error-red);">
              Revisa el valor objetivo — una meta no alcanzable puede desmotivar. Considera reducir el target o ampliar el plazo.
            </div>
            <p id="smAchErr" style="color:var(--error-red);font-size:11px;margin-top:4px;min-height:14px;"></p>
          </div>

          <!-- R -->
          <div style="margin-bottom:20px;">
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--charcoal-navy);margin-bottom:8px;">
              <span style="width:22px;height:22px;border-radius:50%;background:#8B5CF6;color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">R</span>
              Relevante — ¿Por qué esta meta importa para tu negocio?
            </label>
            <textarea id="smRelevant" rows="2" placeholder="Ej: Mejorar la asistencia aumenta los ingresos y el reconocimiento de mi marca como organizador" style="width:100%;padding:10px 14px;border:1.5px solid #CBD5E1;border-radius:10px;font-family:var(--font-body);font-size:14px;color:var(--charcoal-navy);resize:vertical;"></textarea>
            <p id="smRelevantErr" style="color:var(--error-red);font-size:11px;margin-top:4px;min-height:14px;"></p>
          </div>

          <!-- T -->
          <div style="margin-bottom:24px;">
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--charcoal-navy);margin-bottom:8px;">
              <span style="width:22px;height:22px;border-radius:50%;background:var(--midnight-navy);color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">T</span>
              Con tiempo — Fecha límite para lograr esta meta
            </label>
            <input type="date" id="smDeadline" style="padding:10px 14px;border:1.5px solid #CBD5E1;border-radius:10px;font-family:var(--font-body);font-size:14px;color:var(--charcoal-navy);" />
            <p id="smDeadlineErr" style="color:var(--error-red);font-size:11px;margin-top:4px;min-height:14px;"></p>
          </div>

          <!-- SMART validation summary -->
          <div id="smValidationBar" style="display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap;"></div>

          <button type="submit" class="btn btn--accent btn--lg">Guardar meta SMART</button>
        </form>
      </div>

      <!-- Goals dashboard -->
      <div id="smartGoalsList"></div>
    </div>`;

  // Wire metric → unit label
  document.getElementById("smMetric").addEventListener("change", (e) => {
    const def = smartMetricDefs[e.target.value];
    document.getElementById("smUnit").textContent = def ? def.unit : "";
    updateSmartValidationBar();
  });

  // Wire achievable radio → warning
  document.querySelectorAll('input[name="smAchievable"]').forEach((r) => {
    r.addEventListener("change", () => {
      const no = document.getElementById("smAchNo").checked;
      document.getElementById("smAchWarning").style.display = no ? "block" : "none";
      updateSmartValidationBar();
    });
  });

  // Live validation bar on any input
  ["smSpecific", "smTarget", "smRelevant", "smDeadline"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateSmartValidationBar);
  });

  document.getElementById("smartForm").addEventListener("submit", handleSmartSubmit);

  renderSmartGoalsList();
}

function updateSmartValidationBar() {
  const bar = document.getElementById("smValidationBar");
  if (!bar) return;

  const criteria = [
    { key: "S", label: "Específica",  met: (document.getElementById("smSpecific")?.value || "").trim().length >= 20 },
    { key: "M", label: "Medible",     met: !!(document.getElementById("smMetric")?.value) && parseFloat(document.getElementById("smTarget")?.value) > 0 },
    { key: "A", label: "Alcanzable",  met: !!(document.querySelector('input[name="smAchievable"]:checked')) },
    { key: "R", label: "Relevante",   met: (document.getElementById("smRelevant")?.value || "").trim().length >= 20 },
    { key: "T", label: "Con tiempo",  met: !!(document.getElementById("smDeadline")?.value) },
  ];

  const colors = { S: "var(--electric-cyan)", M: "var(--lime-volt)", A: "var(--success-green)", R: "#8B5CF6", T: "var(--midnight-navy)" };

  bar.innerHTML = criteria.map((c) => {
    const bg = c.met ? colors[c.key] : "#E2E8F0";
    const txt = c.met ? (c.key === "M" ? "white" : c.key === "M" ? "var(--midnight-navy)" : "white") : "var(--slate-grey)";
    const textColor = (c.key === "M" && c.met) ? "var(--midnight-navy)" : c.met ? "white" : "var(--slate-grey)";
    return `<div style="display:flex;align-items:center;gap:5px;background:${bg};border-radius:16px;padding:5px 12px;transition:background .2s;">
      <span style="font-size:12px;font-weight:800;color:${textColor};">${c.key}</span>
      <span style="font-size:11px;color:${textColor};">${c.met ? "✓" : "○"} ${c.label}</span>
    </div>`;
  }).join("");
}

function handleSmartSubmit(e) {
  e.preventDefault();

  const specific  = document.getElementById("smSpecific").value.trim();
  const metric    = document.getElementById("smMetric").value;
  const target    = parseFloat(document.getElementById("smTarget").value);
  const achRadio  = document.querySelector('input[name="smAchievable"]:checked');
  const relevant  = document.getElementById("smRelevant").value.trim();
  const deadline  = document.getElementById("smDeadline").value;

  let valid = true;

  const setErr = (id, msg) => { document.getElementById(id).textContent = msg; if (msg) valid = false; };

  setErr("smSpecificErr",  specific.length < 20  ? "Describe la meta con al menos 20 caracteres." : "");
  setErr("smMetricErr",    !metric               ? "Selecciona una métrica." :
                           !(target > 0)         ? "Ingresa un valor objetivo mayor a cero." : "");
  setErr("smAchErr",       !achRadio             ? "Indica si la meta es alcanzable." : "");
  setErr("smRelevantErr",  relevant.length < 20  ? "Explica la relevancia con al menos 20 caracteres." : "");
  setErr("smDeadlineErr",  !deadline             ? "Define una fecha límite." :
                           deadline <= new Date().toISOString().slice(0,10) ? "La fecha límite debe ser futura." : "");

  if (!valid) return;

  const goal = {
    id:         smartNextId++,
    specific,
    metric,
    target,
    achievable: achRadio.value === "yes",
    relevant,
    deadline,
    createdAt:  new Date().toISOString().slice(0, 10),
  };

  smartGoals.unshift(goal);

  // Reset form
  e.target.reset();
  document.getElementById("smUnit").textContent = "";
  document.getElementById("smValidationBar").innerHTML = "";
  document.getElementById("smAchWarning").style.display = "none";

  renderSmartGoalsList();
  document.getElementById("smartGoalsList").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("Meta SMART guardada correctamente");
}

function renderSmartGoalsList() {
  const container = document.getElementById("smartGoalsList");
  if (!container) return;
  if (!smartGoals.length) { container.innerHTML = ""; return; }

  const today = new Date();

  const cards = smartGoals.map((g) => {
    const def = smartMetricDefs[g.metric] || { label: g.metric, unit: "", prefix: false };
    const current = getCurrentMetricValue(g.metric);
    const pct = Math.min(Math.round((current / g.target) * 100), 100);
    const exceeded = current >= g.target;

    const deadline = new Date(g.deadline);
    const daysLeft = Math.ceil((deadline - today) / 86400000);
    const isOverdue = daysLeft < 0;
    const isAtRisk = !isOverdue && daysLeft <= 14 && pct < 80;

    const statusLabel = exceeded ? "Meta alcanzada" : isOverdue ? "Vencida" : isAtRisk ? "En riesgo" : "En curso";
    const statusColor = exceeded ? "var(--success-green)" : isOverdue ? "var(--error-red)" : isAtRisk ? "#F59E0B" : "var(--electric-cyan)";
    const barColor   = exceeded ? "var(--success-green)" : isAtRisk || isOverdue ? "var(--error-red)" : "var(--electric-cyan)";

    const fmtVal = (v) => {
      const rounded = g.metric === "roi" ? v.toFixed(1) : Math.round(v).toLocaleString("es-PE");
      return def.prefix ? `S/ ${rounded}` : `${rounded} ${def.unit}`;
    };

    const timeLabel = exceeded ? "Completada" : isOverdue ? `Venció hace ${Math.abs(daysLeft)} días` : `${daysLeft} días restantes`;

    const smartBadges = [
      { l: "S", title: "Específica",  color: "var(--electric-cyan)", textColor: "white" },
      { l: "M", title: "Medible",     color: "var(--lime-volt)",     textColor: "var(--midnight-navy)" },
      { l: "A", title: "Alcanzable",  color: "var(--success-green)", textColor: "white" },
      { l: "R", title: "Relevante",   color: "#8B5CF6",              textColor: "white" },
      { l: "T", title: "Con tiempo",  color: "var(--midnight-navy)", textColor: "white" },
    ].map((b) => `<span title="${b.title}" style="width:20px;height:20px;border-radius:50%;background:${b.color};color:${b.textColor};font-size:9px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;">${b.l}</span>`).join("");

    return `
      <div style="background:white;border-radius:var(--radius-lg);padding:24px 28px;box-shadow:var(--shadow);margin-bottom:16px;border-left:5px solid ${statusColor};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
          <div style="flex:1;min-width:200px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              ${smartBadges}
            </div>
            <p style="color:var(--midnight-navy);font-size:14px;font-weight:700;line-height:1.4;">${g.specific}</p>
            <p style="color:var(--slate-grey);font-size:12px;margin-top:4px;">Métrica: <strong>${def.label}</strong></p>
          </div>
          <div style="text-align:right;">
            <div style="background:${statusColor}22;color:${statusColor};font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;margin-bottom:6px;display:inline-block;">${statusLabel}</div>
            <div style="font-size:11px;color:var(--slate-grey);">${timeLabel}</div>
          </div>
        </div>

        <div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
            <span style="color:var(--charcoal-navy);">Progreso actual: <strong style="color:${barColor};">${fmtVal(current)}</strong></span>
            <span style="color:var(--slate-grey);">Objetivo: <strong style="color:var(--midnight-navy);">${fmtVal(g.target)}</strong></span>
          </div>
          <div style="height:14px;background:#E2E8F0;border-radius:7px;overflow:hidden;position:relative;">
            <div style="height:100%;width:${pct}%;background:${barColor};border-radius:7px;transition:width .6s ease;"></div>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:${pct>40?"white":"var(--charcoal-navy)"};">${pct}%</div>
          </div>
        </div>

        <details style="margin-top:10px;">
          <summary style="cursor:pointer;font-size:12px;color:var(--electric-cyan);font-weight:700;list-style:none;">Ver criterios SMART completos</summary>
          <div style="margin-top:12px;display:grid;gap:8px;">
            ${smartCriterionRow("S","Específica","var(--electric-cyan)","white",g.specific)}
            ${smartCriterionRow("M","Medible","var(--lime-volt)","var(--midnight-navy)",`${def.label} → objetivo: ${fmtVal(g.target)}`)}
            ${smartCriterionRow("A","Alcanzable","var(--success-green)","white",g.achievable?"Confirmado como alcanzable con recursos actuales":"Marcada para revisión")}
            ${smartCriterionRow("R","Relevante","#8B5CF6","white",g.relevant)}
            ${smartCriterionRow("T","Con tiempo","var(--midnight-navy)","white",`Fecha límite: ${formatDate(g.deadline)}`)}
          </div>
        </details>

        <div style="margin-top:14px;text-align:right;">
          <button class="btn btn--ghost" onclick="deleteSmartGoal(${g.id})" style="font-size:12px;padding:6px 14px;color:var(--error-red);border-color:var(--error-red);">Eliminar</button>
        </div>
      </div>`;
  }).join("");

  container.innerHTML = `
    <h4 style="color:var(--midnight-navy);font-size:18px;margin-bottom:16px;">Dashboard de metas (${smartGoals.length})</h4>
    ${cards}`;
}

function smartCriterionRow(letter, label, bg, fg, text) {
  return `<div style="display:flex;gap:10px;align-items:flex-start;background:#F8FAFC;border-radius:8px;padding:10px 14px;">
    <span style="width:22px;height:22px;border-radius:50%;background:${bg};color:${fg};font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${letter}</span>
    <div><div style="font-size:11px;font-weight:700;color:var(--slate-grey);text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px;">${label}</div><div style="font-size:13px;color:var(--charcoal-navy);">${text}</div></div>
  </div>`;
}

function deleteSmartGoal(id) {
  const idx = smartGoals.findIndex((g) => g.id === id);
  if (idx === -1) return;
  smartGoals.splice(idx, 1);
  renderSmartGoalsList();
  showToast("Meta eliminada");
}

// MutationObserver: initialize when view-perfil becomes visible
document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    if (document.getElementById("smartSection")) renderSmartPanel();
  });
  observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["style"] });
});