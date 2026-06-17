/* ============================================================ */
/* EVENTLIVE - store.js                                         */
/* Estado central compartido (en memoria). Unica fuente de      */
/* verdad: todo lo que el usuario crea o cambia se guarda aqui   */
/* y se refleja en todas las vistas. Al recargar se reinicia     */
/* (demo sin backend, como pide el statement).                  */
/* ------------------------------------------------------------ */
/* FIX: se agregan estructuras para historial de asistencia,    */
/* resenas publicas por evento, feed y normas de comunidades,   */
/* centro de notificaciones, cancelacion de eventos y correos   */
/* ya registrados (para los Escenarios 2 de varias US).         */
/* ============================================================ */

const EventLiveStore = {
  // ----- Sesion ----- (canOrganize: si ademas puede operar como organizador, US44)
  session: { loggedIn: false, user: null, role: null, canOrganize: false },

  // correos "ya registrados" para simular el Escenario 2 de US40
  takenEmails: ["demo@eventlive.com", "valeria@eventlive.com"],

  // ----- Datos semilla de eventos (coordenadas reales de Lima) -----
  events: [
    { id: 1, name: "Feria de arte urbano", category: "Arte", lat: -12.1462, lng: -77.0220, address: "Parque Kennedy, Miraflores", time: "18:00", durationMin: 240, capacity: 150, occupied: 90, verified: true, verifiedAt: "hoy 17:12", organizer: "Colectivo Arte Urbano", img: "linear-gradient(135deg,#0E9DB0,#102A3F)" },
    { id: 2, name: "Concierto indie en vivo", category: "Música", lat: -12.1391, lng: -77.0217, address: "C.C. Barranco", time: "21:00", durationMin: 180, capacity: 200, occupied: 170, verified: true, verifiedAt: "hoy 19:40", organizer: "Productora Indie Lima", img: "linear-gradient(135deg,#7CB518,#0E9DB0)" },
    { id: 3, name: "Torneo gaming regional", category: "Gaming", lat: -12.1035, lng: -77.0290, address: "San Isidro", time: "15:00", durationMin: 300, capacity: 120, occupied: 48, verified: false, organizer: "GameZone Perú", img: "linear-gradient(135deg,#102A3F,#061421)" },
    { id: 4, name: "Feria gastronómica nocturna", category: "Gastronomía", lat: -12.1518, lng: -77.0210, address: "Av. La Mar, Miraflores", time: "19:00", durationMin: 240, capacity: 300, occupied: 285, verified: true, verifiedAt: "hoy 18:05", organizer: "Sabores de Lima", img: "linear-gradient(135deg,#14C4D9,#A6E22E)" },
    { id: 5, name: "Exposición fotográfica", category: "Arte", lat: -12.1205, lng: -77.0290, address: "Pueblo Libre", time: "17:00", durationMin: 180, capacity: 80, occupied: 24, verified: true, verifiedAt: "ayer 17:30", organizer: "Galería Norte", img: "linear-gradient(135deg,#0E9DB0,#7CB518)" },
    { id: 6, name: "Festival K-pop", category: "K-pop", lat: -12.0931, lng: -77.0465, address: "Magdalena del Mar", time: "16:00", durationMin: 300, capacity: 250, occupied: 175, verified: false, organizer: "K-Wave Perú", img: "linear-gradient(135deg,#14C4D9,#102A3F)" },
    { id: 7, name: "Noche de jazz", category: "Música", lat: -12.1320, lng: -77.0260, address: "Barranco", time: "20:30", durationMin: 150, capacity: 90, occupied: 60, verified: true, verifiedAt: "hoy 20:01", organizer: "Jazz Club Lima", img: "linear-gradient(135deg,#7CB518,#14C4D9)" },
    { id: 8, name: "Mercado de diseño independiente", category: "Arte", lat: -12.1100, lng: -77.0350, address: "San Isidro", time: "11:00", durationMin: 360, capacity: 200, occupied: 70, verified: true, verifiedAt: "hoy 11:20", organizer: "Diseña Perú", img: "linear-gradient(135deg,#102A3F,#0E9DB0)" },
  ],

  // ----- Datos del usuario (se llenan con su actividad real) -----
  favorites: [],         // ids de eventos
  joinedCommunities: [], // ids de comunidades
  followedOrganizers: [],// nombres de organizadores
  myReviews: [],         // { eventId, eventName, rating, text, date }
  myPublishedEvents: [], // ids de eventos publicados por el organizador
  userInterests: [],
  // US30/US32: historial de asistencia validada por GPS (semilla para que
  // recomendaciones y resenas tengan base real desde la primera sesion)
  attendedEvents: [2, 5],

  // US32: resenas publicas visibles en la ficha de cada evento (de otros usuarios)
  eventReviews: {
    1: [{ author: "Diego R.", rating: 5, text: "Excelente curaduría, volvería.", verified: true, date: "hace 2 días" }],
    2: [
      { author: "Camila P.", rating: 5, text: "La mejor noche del mes.", verified: true, date: "hace 1 día" },
      { author: "Andrés M.", rating: 4, text: "Buen sonido, faltó espacio.", verified: true, date: "hace 3 días" },
    ],
    4: [{ author: "Lucía B.", rating: 4, text: "Mucha variedad de food trucks.", verified: true, date: "hace 5 días" }],
    7: [{ author: "Marco T.", rating: 5, text: "Ambiente íntimo, músicos top.", verified: true, date: "hace 1 semana" }],
  },

  communities: [
    { id: 1, name: "Amantes del K-pop Lima", members: 1240, category: "K-pop" },
    { id: 2, name: "Arte urbano y murales", members: 856, category: "Arte" },
    { id: 3, name: "Foodies de Barranco", members: 2100, category: "Gastronomía" },
    { id: 4, name: "Indie & Rock Perú", members: 1530, category: "Música" },
    { id: 5, name: "Gamers Lima Metropolitana", members: 980, category: "Gaming" },
  ],

  // US31: feed exclusivo de eventos por comunidad (ids de events) + normas
  communityFeed: { 1: [6], 2: [1, 5, 8], 3: [4], 4: [2, 7], 5: [3] },
  communityRules: {
    1: "Respeta a todos los fandoms. Prohibido reventa de entradas.",
    2: "Comparte solo arte propio o con crédito. Cero spam.",
    3: "Reseñas honestas. No promociones sin avisar a moderación.",
    4: "Cero odio entre géneros musicales. Apoya a bandas locales.",
    5: "Buen ambiente competitivo. Prohibido contenido tóxico.",
  },

  organizers: [
    { name: "Colectivo Arte Urbano", events: 24, category: "Arte" },
    { name: "Productora Indie Lima", events: 18, category: "Música" },
    { name: "Sabores de Lima", events: 31, category: "Gastronomía" },
    { name: "GameZone Perú", events: 12, category: "Gaming" },
  ],

  // US06/US23/US31/US33: centro de notificaciones in-app
  notifications: [],

  _nextEventId: 100,
  _nextNotifId: 1,

  // ----- Helpers -----
  getEvent(id) { return this.events.find(e => e.id === id); },
  // eventos visibles en el catalogo (no cancelados)
  activeEvents() { return this.events.filter(e => !e.cancelled); },

  toggleFavorite(id) {
    const i = this.favorites.indexOf(id);
    if (i >= 0) { this.favorites.splice(i, 1); return false; }
    this.favorites.push(id); return true;
  },
  isFavorite(id) { return this.favorites.includes(id); },

  toggleCommunity(id) {
    const i = this.joinedCommunities.indexOf(id);
    const co = this.communities.find(c => c.id === id);
    if (i >= 0) { this.joinedCommunities.splice(i, 1); if (co) co.members--; return false; }
    this.joinedCommunities.push(id); if (co) co.members++; return true;
  },
  isJoined(id) { return this.joinedCommunities.includes(id); },
  communityEvents(id) { return (this.communityFeed[id] || []).map(eid => this.getEvent(eid)).filter(Boolean); },

  toggleFollow(name) {
    const i = this.followedOrganizers.indexOf(name);
    if (i >= 0) { this.followedOrganizers.splice(i, 1); return false; }
    this.followedOrganizers.push(name); return true;
  },
  isFollowing(name) { return this.followedOrganizers.includes(name); },

  // US32: asistencia validada
  hasAttended(id) { return this.attendedEvents.includes(id); },
  getAttendedEvents() { return this.attendedEvents.map(id => this.getEvent(id)).filter(Boolean); },

  addReview(eventId, rating, text) {
    const ev = this.getEvent(eventId);
    const name = this.session.user ? this.session.user.name : "Tú";
    // mi historial (una resena por evento)
    this.myReviews = this.myReviews.filter(r => r.eventId !== eventId);
    this.myReviews.push({ eventId, eventName: ev ? ev.name : "Evento", rating, text, date: new Date().toLocaleDateString("es-PE") });
    // resena publica en la ficha del evento (reemplaza la propia si ya existia)
    if (!this.eventReviews[eventId]) this.eventReviews[eventId] = [];
    this.eventReviews[eventId] = this.eventReviews[eventId].filter(r => !r._mine);
    this.eventReviews[eventId].unshift({ author: name, rating, text, verified: true, date: "ahora", _mine: true });
  },
  getReview(eventId) { return this.myReviews.find(r => r.eventId === eventId); },
  getEventReviews(eventId) { return this.eventReviews[eventId] || []; },

  publishEvent(data) {
    const id = this._nextEventId++;
    const ev = { id, occupied: 0, verified: false, cancelled: false, organizer: this.session.user ? this.session.user.name : "Tú", img: "linear-gradient(135deg,#14C4D9,#A6E22E)", ...data };
    this.events.push(ev);
    this.myPublishedEvents.push(id);
    return ev;
  },
  getMyEvents() { return this.myPublishedEvents.map(id => this.getEvent(id)).filter(Boolean); },
  cancelEvent(id) { const ev = this.getEvent(id); if (ev) ev.cancelled = true; },

  // notificaciones
  addNotification(n) {
    const note = { id: this._nextNotifId++, read: false, ...n };
    this.notifications.unshift(note);
    return note;
  },
  unreadCount() { return this.notifications.filter(n => !n.read).length; },
  markAllRead() { this.notifications.forEach(n => n.read = true); },

  getAttendeeEvents() {
    return this.activeEvents().filter(e => this.followedOrganizers.includes(e.organizer));
  },
};
