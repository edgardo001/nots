# Research: Mejoras UX/URL/Markdown en Notas

## Technology Decisions

### URL Sync con `history.replaceState`
- **Decision**: Usar `history.replaceState` + `popstate` event listener + `URLSearchParams`
- **Rationale**: No queremos React Router para una SPA. Reemplazar historial evita entradas duplicadas en el historial del navegador. `URLSearchParams` es nativo y liviano.
- **Alternatives considered**: React Router (overkill para SPA sin rutas reales), hash-based routing (menos limpio)

### Task Lists en Markdown
- **Decision**: Usar `remark-gfm` (ya incluido) con opción `remarkPlugins: [[remarkGfm, { tableCellPadding: true }]]` y CSS para checkboxes
- **Rationale**: `remark-gfm` ya soporta GFM task lists nativamente. Solo requiere CSS para checkbox styling.
- **Note**: Los checkboxes son read-only en preview (no interactivos). Si se desea interactividad, sería un cambio futuro.

### Drag & Drop Layout Rectifying
- **Decision**: Usar `layoutIngnoreTransforms: false` + `useDndMonitor` + `rectSortingStrategy` con `activateSize` para evitar overlap
- **Rationale**: `@dnd-kit` tiene `rectSortingStrategy` que calcula posiciones finales. El overlap ocurre porque los ítems no se reposicionan hasta el `onDragEnd`. Con `dragOverlay` + `z-index` podemos mejorar.
- **Alternatives considered**: `pointerWithin` collision detection (default OK), custom collision detection

### Efecto Hoja Arrugada
- **Decision**: CSS con filter + clip-path + keyframe animation. SVG filter para textura wrinkled.
- **Rationale**: Efecto puramente visual sin dependencias. SVG filter `feTurbulence` + `feDisplacementMap` crea textura arrugada realista.
- **Implementation**:
  - **Estático**: Clase CSS `.crumpled` con SVG filter background
  - **Animación**: Keyframe que escala y aplica filter progresivamente al eliminar

### Settings Modal
- **Decision**: Modal similar a StorageIndicator, con navegación lateral por secciones (menú izquierdo, contenido derecho)
- **Rationale**: Consistencia con UI existente. Reutilizar patrón de modal overlay.
- **Alternatives considered**: Drawer, página separada (inconsistente con SPA actual)

### Eliminar Versión
- **Decision**: Nueva función `deleteVersion(id)` en db/operations.ts + botón en el panel de versiones
- **Rationale**: Extensión natural del CRUD de versiones. Bajo impacto.

### Visor de Versión (Read-Only)
- **Decision**: Panel expandible dentro del version history, con preview markdown renderizado y botones Fork/Restore
- **Rationale**: Sin modal adicional. Reutiliza `react-markdown` existente. Flujo natural: ver contenido → decidir restaurar/forkear.

### Notas de Ejemplo (Seed Data)
- **Decision**: Array estático de 5 objetos Note en `notesStore.ts`, insertados si `getAllNotes()` retorna vacío
- **Rationale**: Simple, sin dependencias. Datos representativos que muestran todas las capacidades (markdown, checklists, colores, emojis).
- **Guard**: Se ejecuta solo si `notes.length === 0` después de `loadNotes()`, usando flag `seeded` en sessionStorage para evitar doble seed en sesiones paralelas (BroadcastChannel).

### Animación de Fuego (Borrar Todo)
- **Decision**: CSS keyframe `@keyframes burnOut` + `::before`/`::after` pseudo-elementos con emoji 🔥 animados. Sin dependencias externas.
- **Rationale**: Efecto dramático pero liviano. Usar `clip-path` polygon que se reduce + color shift a naranja/negro + partículas de fuego con emoji.
- **Alternatives considered**: Canvas/WebGL (overkill), GIF animado (pixelado), librería de partículas (nueva dependencia)

### Favicon
- **Decision**: SVG inline en `index.html` como data URI dentro de `<link rel="icon">`, con un diseño de nota/post-it estilizado
- **Rationale**: SVG es escalable, funciona en todos los navegadores modernos, no requiere archivo adicional. Post-it amarillo con doblez minimalista.
- **Alternatives considered**: PNG (requiere build step), emoji favicon (inconsistente entre navegadores)

### I18N Estrategia
- **Decision**: Archivos planos `{key: string}` en `src/i18n/es.ts` y `src/i18n/en.ts`, hook `useT()` vía Zustand store `localeStore`
- **Rationale**: Liviano, cero dependencias. Zustand ya está en el proyecto. No necesitamos react-i18next (pesado, más bundles).
- **Pattern**: `t('header.search_placeholder')` → retorna string según locale activo. Fallback a key si no existe traducción.
- **Locale detection**: `navigator.language.startsWith('es') ? 'es' : 'en'`
- **Alternatives considered**: react-i18next (más robusto pero dependencia extra), Intl.MessageFormat (innecesario para ES/EN simple)

## Browser Support

| API | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| `history.replaceState` | 5+ | 12+ | 4+ | 5+ |
| `URLSearchParams` | 49+ | 17+ | 44+ | 10.3+ |
| `feTurbulence` (SVG filter) | 1+ | 12+ | 3+ | 3+ |
| CSS `clip-path` | 55+ | 79+ | 54+ | 9.1+ |
| CSS `@keyframes` | 5+ | 12+ | 5+ | 4+ |
| `navigator.language` | 5+ | 12+ | 2+ | 5+ |
| SVG Favicon | 5+ | 12+ | 4+ | 5+ |

Soporte universal desde 2026.

## License Check

| Dependencia | Licencia | Cambio |
|---|---|---|
| remark-gfm | MIT (ya incluido) | Solo config |
| @dnd-kit/core | MIT (ya incluido) | Solo config |
| @dnd-kit/sortable | MIT (ya incluido) | Solo config |

✅ Sin nuevas dependencias externas.
