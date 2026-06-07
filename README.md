# EventLive - Landing Page funcional (VibeSpot)

Landing Page de EventLive desarrollado en HTML, CSS y JavaScript.
Combina una página informativa atractiva con una demo funcional que
simula las 30 User Stories del core del producto.

## Cómo está organizado (coherencia del flujo)

El Landing tiene DOS modos conectados de forma coherente:

1. **Modo informativo** (`#publicSite`): la página pública con hero,
   características, cómo funciona, video, organizadores, testimonios y footer.
   Aquí están los botones de Iniciar sesión y Registrarse.

2. **Modo app** (`#appSite`): aparece SOLO después de iniciar sesión o
   registrarse. Contiene las vistas funcionales (mapa, dashboard, publicar,
   comunidades, perfil) donde viven las 30 User Stories.

El puente entre ambos es el **modal de login/registro** (`#authModal`).
Nadie llega "mágicamente" al mapa: primero pasa por el registro/login.
Al cerrar sesión, regresa coherentemente al modo informativo.

## Estructura de archivos

```
eventlive-landing/
├── index.html
├── css/
│   ├── styles.css       Variables, componentes y diseño visual (COMUN)
│   └── responsive.css   Media queries mobile-first (COMUN)
├── js/
│   ├── main.js          COMUN: navegación, login/logout, toast. NO MODIFICAR.
│   ├── map.js           BLOQUE A (EJEMPLO COMPLETO): mapa US01-05
│   ├── dashboard.js     BLOQUE A (EJEMPLO COMPLETO): dashboard IA US21, US23
│   ├── filters.js       BLOQUE B: US02, US03, US04, US05
│   ├── notifications.js BLOQUE C: US06, US07, US08, US09
│   ├── events-manage.js BLOQUE D: US11, US12, US13, US16
│   ├── reports.js       BLOQUE E: US18, US19, US20, US26
│   ├── analytics.js     BLOQUE F: US22, US24, US25, US27
│   ├── community.js     BLOQUE G: US28, US29, US30, US31
│   └── social.js        BLOQUE H: US32, US33, US34, US38
└── assets/img/
```

## Cómo trabajar (para cada integrante)

1. Abre el archivo .js de tu bloque (mira el comentario con tu nombre).
2. Estudia js/map.js y js/dashboard.js: son ejemplos COMPLETOS y funcionales.
   Copia ese patrón (datos en memoria, render, interacción, toast).
3. Tu sección en index.html ya tiene su contenedor marcado con BLOQUE X.
4. Programa tu lógica dentro de tu archivo .js, usando tu contenedor.
5. NO modifiques navbar, footer ni main.js sin avisar al líder.
6. Usa las variables de color (var(--electric-cyan), etc.), nunca hex sueltos.
7. Nombra todo en inglés y camelCase.

## Reparto de bloques

| Bloque | Responsable | User Stories |
|--------|-------------|--------------|
| A | Jesús    | US01, US02, US03, US04, US05, US21, US23 |
| B | [Nombre] | apoyo a ficha y filtros |
| C | [Nombre] | US06, US07, US08, US09 |
| D | [Nombre] | US11, US12, US13, US16 |
| E | [Nombre] | US18, US19, US20, US26 |
| F | [Nombre] | US22, US24, US25, US27 |
| G | [Nombre] | US28, US29, US30, US31 |
| H | [Nombre] | US32, US33, US34, US38 |

## Cómo probarlo

Abre index.html en el navegador (o usa Live Server en VS Code).
Haz clic en "Registrarse" o "Probar la demo", completa el formulario
(correo + contraseña de 8+ caracteres) y entrarás al modo app con el mapa.

## Despliegue

GitHub Pages: Settings -> Pages -> rama main -> Save.
