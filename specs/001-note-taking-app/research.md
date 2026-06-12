# Research: Note-Taking App

## Technology Decisions

### React 19 + Vite 6 + TypeScript 5 (strict)
- **Decision**: Usar React 19 con Vite 6 como build tool y TypeScript 5 en modo estricto
- **Rationale**: React 19 es el release más reciente con mejoras en concurrent rendering y hooks. Vite 6 ofrece HMR ultrarrápido y builds optimizados. TypeScript strict previene errores en tiempo de compilación.
- **Alternatives considered**: Next.js (no necesita SSR), Create React App (deprecado), Parcel (menor ecosistema)

### Bun 1.3.14 como runtime
- **Decision**: Usar Bun como runtime de desarrollo
- **Rationale**: Bun es compatible con npm registry, es más rápido que Node para instalación de dependencias y tiene built-in test runner y bundler. Ya instalado en el entorno.
- **Alternatives considered**: Node.js (disponible pero más lento), Deno (menos compatible con ecosistema React)

### Zustand para estado global
- **Decision**: Usar Zustand en lugar de Jotai
- **Rationale**: Zustand es más maduro, tiene mejor integración con TypeScript, y su API basada en stores es más natural para una app con múltiples fuentes de datos (notes, trash, UI state). Bundle size ~1KB.
- **Alternatives considered**: Jotai (átomos más granulares), Redux Toolkit (demasiado boilerplate para este alcance), Context API (re-renders innecesarios)

### idb para IndexedDB
- **Decision**: Usar `idb` como wrapper de IndexedDB
- **Rationale**: API basada en promesas, tipado completo, manejo de transacciones, soporte para versionado de schema. Es la recommended library para IndexedDB en proyectos modernos.
- **Alternatives considered**: Dexie.js (más pesado, más features de las necesarias), localStorage (límite 5MB, síncrono, no apto para imágenes)

### react-markdown + remark-gfm para Markdown
- **Decision**: Usar react-markdown con remark-gfm para renderizado y rehype-highlight para syntax highlighting
- **Rationale**: react-markdown no usa dangerouslySetInnerHTML (seguro contra XSS por defecto), remark-gfm añade soporte para tablas, tachado, y listas de tareas. Ecosistema unificado (unified/remark/rehype).
- **Alternatives considered**: marked (usa innerHTML, riesgo XSS), showdown (no seguro), marked-react (menos maduro)

### @dnd-kit/core para drag & drop
- **Decision**: Usar @dnd-kit/core
- **Rationale**: Es la librería más moderna y accesible para React. Soporta acceso por teclado, ARIA, touch events, y múltiples contenedores (sidebar ↔ body). No depende de HTML5 drag & drop API (falla en móviles).
- **Alternatives considered**: react-beautiful-dnd (deprecado, no mantenido), react-dnd (API más compleja), interactjs (no específico React)

### vite-plugin-pwa para PWA
- **Decision**: Usar vite-plugin-pwa con Workbox
- **Rationale**: Integración directa con Vite, genera manifest.json y service worker automáticamente en build. Soporta estrategias de cache, precaching, y actualizaciones.
- **Alternatives considered**: workbox-webpack-plugin (no compatible con Vite), sw-precache (deprecado)

### date-fns para fechas
- **Decision**: Usar date-fns en lugar de moment.js o dayjs
- **Rationale**: Tree-shakeable (solo importar funciones usadas), inmmutable, tipado completo. Ideal para manejo de UTC y formatos ISO.
- **Alternatives considered**: dayjs (similar pero menos funcionalidades), Luxon (más pesado), moment.js (deprecado)

## Dependencies License Check

| Dependencia | Licencia |
|---|---|
| react, react-dom | MIT |
| zustand | MIT |
| idb | ISC |
| react-markdown | MIT |
| remark-gfm | MIT |
| rehype-highlight | MIT |
| @dnd-kit/core | MIT |
| vite-plugin-pwa | MIT |
| date-fns | MIT |
| emoji-mart | MIT |
| vitest | MIT |
| @testing-library/react | MIT |
| typescript | Apache-2.0 |
| vite | MIT |

✅ Todas las dependencias cumplen con la política de licencias.

## IndexedDB Storage Limits

- Límite por defecto: ~50% del espacio disponible en disco
- En Chrome: hasta 80% del espacio total del disco
- En Firefox: hasta 50% del disco (máximo 10GB)
- Safari: hasta 1GB (solicita permiso para más)
- **Estrategia**: Mostrar indicador de uso cuando se supere el 70% del límite estimado
- **Tamaño máximo por adjunto**: 10MB
- **Máximo de versiones por nota**: 50

## PWA Requirements

- manifest.json con nombre "Notas Post-It", theme_color, background_color
- Service worker con estrategia "CacheFirst" para assets y "NetworkOnly" para datos (IndexedDB es offline nativo)
- Icons en tamaños: 192x192, 512x512
- Splash screen configurable
- Estrategia de actualización: mostrar toast al usuario cuando haya nueva versión disponible
