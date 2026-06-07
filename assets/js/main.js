/* ============================================================ */
/* EVENTLIVE - main.js  (COMUN, no modificar sin avisar)        */
/* Maneja: navegacion, el flujo coherente login -> app,         */
/* el menu responsive y el sistema de toast (notificaciones).   */
/* ============================================================ */

/* ---------- Estado de sesion en memoria (se borra al recargar) ---------- */
const appState = {
  loggedIn: false,
  user: null,        // { name, email }
  authMode: "login", // "login" o "register"
};

/* ============================================================ */
/* FLUJO DE AUTENTICACION (el puente informativo <-> app)       */
/* ============================================================ */

// Abre el modal de login o registro
function openAuth(mode) {
  appState.authMode = mode;
  document.getElementById("authModal").style.display = "flex";
  switchAuth(mode);
}

// Cierra el modal
function closeAuth() {
  document.getElementById("authModal").style.display = "none";
  document.getElementById("authError").textContent = "";
}

// Cambia entre pestana login y registro
function switchAuth(mode) {
  appState.authMode = mode;
  const isRegister = mode === "register";
  document.getElementById("tabLogin").classList.toggle("modal__tab--active", !isRegister);
  document.getElementById("tabRegister").classList.toggle("modal__tab--active", isRegister);
  document.getElementById("nameField").style.display = isRegister ? "block" : "none";
  document.getElementById("authSubmit").textContent = isRegister ? "Crear cuenta" : "Iniciar sesión";
  document.getElementById("authError").textContent = "";
}

// Procesa el formulario de login/registro (simulado en memoria)
document.getElementById("authForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();
  const name = document.getElementById("authName").value.trim();
  const errorEl = document.getElementById("authError");

  // Validacion simple (US40 registro, US41 login)
  if (!email || !password) {
    errorEl.textContent = "Completa todos los campos.";
    return;
  }
  if (password.length < 8) {
    errorEl.textContent = "La contraseña debe tener al menos 8 caracteres.";
    return;
  }
  if (appState.authMode === "register" && !name) {
    errorEl.textContent = "Ingresa tu nombre.";
    return;
  }

  // Login/registro exitoso: guarda usuario en memoria y entra a la app
  appState.loggedIn = true;
  appState.user = { name: name || email.split("@")[0], email };
  closeAuth();
  enterApp();
  showToast(appState.authMode === "register" ? "¡Cuenta creada! Bienvenido a EventLive" : "¡Bienvenido de vuelta!");
});

/* ============================================================ */
/* CAMBIO COHERENTE ENTRE MODO INFORMATIVO Y MODO APP           */
/* ============================================================ */

// Entra al modo app (tras login): oculta el sitio publico, muestra la app
function enterApp() {
  document.getElementById("publicSite").style.display = "none";
  document.getElementById("appSite").style.display = "block";
  // Cambia el navbar al modo app
  document.getElementById("publicLinks").style.display = "none";
  document.getElementById("publicActions").style.display = "none";
  document.getElementById("appLinks").style.display = "flex";
  document.getElementById("appActions").style.display = "flex";
  document.getElementById("navUserName").textContent = "Hola, " + appState.user.name;
  showAppView("view-mapa"); // entra directo al mapa
  window.scrollTo(0, 0);
}

// Cierra sesion: regresa coherentemente al sitio publico (US46)
function logout() {
  appState.loggedIn = false;
  appState.user = null;
  document.getElementById("appSite").style.display = "none";
  document.getElementById("publicSite").style.display = "block";
  document.getElementById("publicLinks").style.display = "flex";
  document.getElementById("publicActions").style.display = "flex";
  document.getElementById("appLinks").style.display = "none";
  document.getElementById("appActions").style.display = "none";
  window.scrollTo(0, 0);
  showToast("Sesión cerrada");
}

// Muestra una vista de la app y oculta las demas (navegacion interna coherente)
function showAppView(viewId) {
  document.querySelectorAll(".app-view").forEach((v) => { v.style.display = "none"; });
  const view = document.getElementById(viewId);
  if (view) view.style.display = "block";
  window.scrollTo(0, 0);
}

// Vuelve al inicio del sitio publico al hacer clic en el logo
function goHome() {
  if (appState.loggedIn) {
    showAppView("view-mapa");
  } else {
    scrollToId("inicio");
  }
}

/* ============================================================ */
/* UTILIDADES COMUNES                                           */
/* ============================================================ */

// Scroll suave a una seccion del sitio publico
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// Sistema de toast: lo usan todos los bloques para feedback (US visibilidad del estado)
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("toast--show");
  setTimeout(() => { toast.classList.remove("toast--show"); }, 2800);
}

// Placeholder de video (reemplazar por iframe real cuando este el video)
function playVideo() {
  showToast("Aquí se reproducirá el Video About-the-Product");
}

/* ---------- Menu hamburguesa responsive ---------- */
const navToggle = document.getElementById("navToggle");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const links = appState.loggedIn
      ? document.getElementById("appLinks")
      : document.getElementById("publicLinks");
    const isOpen = links.style.display === "flex";
    links.style.display = isOpen ? "none" : "flex";
    links.classList.toggle("navbar__links--mobile-open");
  });
}

/* ---------- Scroll suave en enlaces del sitio publico ---------- */
document.querySelectorAll('#publicLinks a').forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      e.preventDefault();
      scrollToId(href.substring(1));
    }
  });
});
