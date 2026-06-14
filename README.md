# EventLive — Landing Page funcional (prototipo)

Demo funcional de EventLive (startup VibeSpot): radar de eventos culturales
en tiempo real con geolocalización. Simula las User Stories del core con
datos en memoria, sin backend (según el statement del curso). Al recargar,
el estado se reinicia.

## Cómo abrir
Abre `index.html` en el navegador. Necesita conexión a internet para cargar
las imágenes del mapa (calles de OpenStreetMap). La librería del mapa
(Leaflet) ya viene incluida localmente en `assets/vendor/`.

## Estructura
```
eventlive-landing/
├── index.html
└── assets/
    ├── css/
    │   └── styles.css          
    ├── js/
    │   ├── icons.js            
    │   ├── store.js            
    │   ├── app.js                                 
    │   ├── map.js              
    │   ├── views-attendee.js   
    │   └── views-organizer.js  
    ├── vendor/                 
    └── img/                    
```

## Arquitectura por roles
Al registrarse, el usuario elige rol:
- **Asistente**: Mapa, Para ti, Favoritos, Comunidades, Mi perfil.
- **Organizador**: Mapa, Publicar, Mis eventos, Inteligencia de mercado.

Un Asistente puede **convertirse en organizador** (RUC + nombre comercial) y
**alternar entre ambos modos** desde la barra superior o su perfil (US44).

Todo lo que el usuario crea o cambia (favoritos, comunidades, seguidos,
reseñas, intereses, eventos publicados, notificaciones) se guarda en el
estado central (`store.js`) y se refleja en las demás vistas.

## Cuentas de prueba
Cualquier correo válido. La contraseña de **registro** debe tener mínimo
8 caracteres, con al menos una mayúscula y un número (p. ej. `Eventlive1`).
Para iniciar sesión basta una contraseña de 8+ caracteres. También hay
acceso simulado con Google / Apple y recuperación de contraseña.
Los correos `demo@eventlive.com` y `valeria@eventlive.com` aparecen como
"ya registrados" para demostrar el flujo de correo duplicado.

## Accesibilidad (resumen)
- Enlace "Saltar al contenido", landmark `<main>` y foco visible en todo
  elemento interactivo.
- Modales con `role="dialog"`/`aria-modal`, cierre con Escape, atrapado de
  foco (focus trap) y retorno de foco al disparador.
- Avisos (toasts y proximidad) en regiones `aria-live`.
- Botones de ícono con nombre accesible; SVG decorativos con `aria-hidden`.
- Tarjetas y elementos activables por teclado (Enter/Espacio).
- Calificación por estrellas con `aria-label` por estrella.

## Notas de implementación
- Los reportes (post-evento y DaaS) se generan como **PDF** mediante el
  diálogo de impresión del navegador ("Guardar como PDF").
- La validación por geofencing, la detección de Booms (IA) y la promoción
  hiper-local están **simuladas** (sin backend).

