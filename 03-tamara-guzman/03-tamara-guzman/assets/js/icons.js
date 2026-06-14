/* ============================================================ */
/* EVENTLIVE - icons.js                                         */
/* Iconos SVG inline reutilizables (sin emojis en el producto). */
/* FIX a11y: todos los <svg> llevan aria-hidden="true" y        */
/* focusable="false" para que los lectores de pantalla anuncien */
/* el aria-label del boton y no el SVG decorativo.              */
/* ============================================================ */
const _S = 'viewBox="0 0 24 24" aria-hidden="true" focusable="false"';
const ICON = {
  pin: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  check: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`,
  shield: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
  chart: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>`,
  bell: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>`,
  clock: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  users: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
  star: `<svg ${_S} fill="currentColor"><path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z"/></svg>`,
  starline: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z"/></svg>`,
  heart: `<svg ${_S} fill="currentColor"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 000-7.8z"/></svg>`,
  heartline: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 000-7.8z"/></svg>`,
  share: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>`,
  edit: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z"/></svg>`,
  copy: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
  trash: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>`,
  image: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
  route: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h6a3 3 0 003-3V8"/></svg>`,
  target: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>`,
  trend: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>`,
  download: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>`,
  ticket: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9a3 3 0 010 6v2a2 2 0 002 2h14a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"/></svg>`,
  calendar: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  play: `<svg ${_S} fill="#04222B"><path d="M8 5v14l11-7z"/></svg>`,
  inbox: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>`,
  /* nuevos */
  x: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
  bolt: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h7l-1 8 10-12h-7z"/></svg>`,
  logout: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>`,
  swap: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4L3 8l4 4"/><path d="M3 8h14a4 4 0 014 4M17 20l4-4-4-4"/><path d="M21 16H7a4 4 0 01-4-4"/></svg>`,
  mapPin: `<svg ${_S} fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
  google: `<svg ${_S} viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0012 22z"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 010-3.8V7.5H3.1a10 10 0 000 9z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 003.1 7.5l3.3 2.6C7.2 7.6 9.4 5.9 12 5.9z"/></svg>`,
  apple: `<svg ${_S} fill="currentColor"><path d="M16.4 12.8c0-2 1.6-3 1.7-3a3.7 3.7 0 00-2.9-1.6c-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7A4 4 0 005.7 11c-1.6 2.8-.4 7 1.1 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2a9 9 0 001.2-2.6 3.8 3.8 0 01-2.3-3.5zM14.3 6.4A3.6 3.6 0 0015.1 4a3.7 3.7 0 00-2.4 1.2 3.4 3.4 0 00-.9 2.4 3 3 0 002.5-1.2z"/></svg>`,
};
