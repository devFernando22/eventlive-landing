# EventLive - Landing Page funcional (VibeSpot)

Landing Page de EventLive en HTML, CSS y JavaScript. Combina una página
informativa atractiva con una demo funcional que simula 30+ User Stories
del core del producto.

## Cómo está organizado (flujo coherente)

DOS modos conectados:

1. **Modo informativo** (`#publicSite`): página pública con hero, features,
   cómo funciona, video, organizadores, testimonios y footer. Aquí están los
   botones de Iniciar sesión y Registrarse.

2. **Modo app** (`#appSite`): aparece SOLO tras iniciar sesión/registrarse.
   Contiene las vistas funcionales (mapa, dashboard, publicar, comunidades,
   perfil) con las User Stories del core.

El puente entre ambos es el modal de login/registro. Nadie llega
"mágicamente" al mapa: primero pasa por el registro. Al cerrar sesión,
regresa al modo informativo.

## IMPORTANTE: el Bloque A YA ESTÁ HECHO (es el ejemplo)

El líder (Jesús) ya implementó el Bloque A completo y funcional:
- js/map.js -> mapa, radio, filtros, ficha, sello verificado (US01-US05)
- js/dashboard.js -> dashboard de IA con predicción (US21, US23)

NO toques estos archivos. Úsalos como EJEMPLO de cómo hacer tu parte:
copia ese patrón (datos en memoria, render, interacción, toast).

## Reparto de las User Stories que FALTAN

Cada integrante implementa SOLO su bloque. El Bloque A ya está listo.

| Responsable | User Stories a implementar | Archivo donde trabajar |
|-------------|----------------------------|------------------------|
| Jesús (líder) | YA HECHO: US01-05, US21, US23 | map.js, dashboard.js (no tocar) |
| [Nombre 1]  | US06, US07, US08, US09 | js/notifications.js |
| [Nombre 2]  | US11, US12, US13, US16 | js/events-manage.js |
| [Nombre 3]  | US18, US19, US20, US26 | js/reports.js |
| [Nombre 4]  | US22, US24, US25, US27 | js/analytics.js |
| [Nombre 5]  | US28, US29, US30, US31 | js/community.js |
| [Nombre 6]  | US32, US33, US34, US38 | js/social.js |
| [Nombre 7]  | US10, US14, US15, US17 | js/filters.js |

Total: 7 (líder) + 27 (equipo) = 34 User Stories del core (mínimo 30 cumplido).

## Cómo trabajar (para cada integrante)

1. Abre TU archivo .js (según la tabla de arriba).
2. Estudia js/map.js y js/dashboard.js: son ejemplos COMPLETOS y funcionales.
3. Tu sección en index.html ya tiene su contenedor marcado con BLOQUE X.
4. Programa tu lógica en tu archivo .js usando tu contenedor.
5. NO modifiques navbar, footer ni main.js sin avisar al líder.
6. Usa las variables de color (var(--electric-cyan), etc.), nunca hex sueltos.
7. Nombra todo en inglés y camelCase.

## Estructura de archivos

```
eventlive-landing/
├── index.html
└── assets/
    ├── css/
    │   └── styles.css       TODO el CSS junto (estilos + responsive). COMUN.
    ├── js/
    │   ├── main.js          COMUN: navegación, login/logout, toast. NO MODIFICAR.
    │   ├── map.js           BLOQUE A - YA HECHO (ejemplo): US01-05
    │   ├── dashboard.js     BLOQUE A - YA HECHO (ejemplo): US21, US23
    │   ├── notifications.js [Nombre 1]: US06, US07, US08, US09
    │   ├── events-manage.js [Nombre 2]: US11, US12, US13, US16
    │   ├── reports.js       [Nombre 3]: US18, US19, US20, US26
    │   ├── analytics.js     [Nombre 4]: US22, US24, US25, US27
    │   ├── community.js     [Nombre 5]: US28, US29, US30, US31
    │   ├── social.js        [Nombre 6]: US32, US33, US34, US38
    │   └── filters.js       [Nombre 7]: US10, US14, US15, US17
    └── img/
```

## Cómo probarlo

Abre index.html (o usa Live Server). Clic en "Registrarse", pon un correo
y contraseña de 8+ caracteres, y entrarás al modo app con el mapa.

## Despliegue

GitHub Pages: Settings -> Pages -> rama main -> Save.
