# Implementation Plan: Mejoras UX/URL/Markdown en Notas

**Branch**: `main` | **Date**: 2026-06-14 | **Spec**: `specs/003-improve-notes-ux/spec.md`

**Input**: Feature specification from `specs/003-improve-notes-ux/spec.md`

## Summary

Mejoras integrales a la experiencia de usuario de la app de notas: sincronización de estado con URL (UUID de nota + query de búsqueda), soporte completo de task lists en markdown, corrección de drag & drop, ayuda markdown interactiva, estilo y animación de "hoja arrugada" para papelera, sección Settings con perfil/autor, y gestión mejorada del historial de versiones (eliminar individual, visor read-only).

## Technical Context

**Language/Version**: TypeScript 5.x (strict), React 19, Bun 1.3.14

**Primary Dependencies**: Sin nuevas dependencias — uso de APIs nativas (`history.replaceState`, `URLSearchParams`, SVG filters) y reconfiguración de `remark-gfm` y `@dnd-kit`

**Storage**: IndexedDB via `idb` — nuevo campo `author` en Note, nueva clave `app:author` en settings

**Testing**: Vitest + Testing Library

**Target Platform**: Navegadores modernos (Chrome, Edge, Firefox, Safari) — cliente web

**Project Type**: Single Page Application (SPA) — frontend puro

**Performance Goals**: Sincronización URL <10ms, animación crumple <500ms, animación fuego <800ms, sin nuevas dependencias

**Constraints**: Sin nuevas dependencias externas. Datos solo locales. Backward compat con notas existentes.

**Scale/Scope**: 1 feature, ~11 áreas de trabajo, ~35 tareas incrementales

## Constitution Check

*GATE: All pass without violations.*

1. ✅ **Client-Side First** — URL sync usa History API nativa, todo 100% frontend
2. ✅ **Privacidad y Datos Locales** — Autor almacenado en IndexedDB local
3. ✅ **TypeScript Estricto** — tipos nuevos con opcionales para backward compat
4. ✅ **Licencias Open Source** — cero nuevas dependencias
5. ✅ **Calidad y Testing** — tests para URL sync, task lists, operaciones de versión
6. ✅ **Accesibilidad WCAG AA** — botón "?" con aria-label, modales con manejo de foco
7. ✅ **PWA / Offline** — sin cambios que afecten offline, History API no requiere red

## Project Structure

### Documentation (this feature)

```text
specs/003-improve-notes-ux/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 research
├── data-model.md        # Phase 1 data model
└── tasks.md             # Implementation tasks
```

### Source Code (modified files)

```text
src/frontend/
├── public/
│   └── favicon.svg             # NUEVO: SVG favicon (post-it icon)
├── src/
│   ├── types/
│   │   └── index.ts            # Agregar author a Note
│   ├── db/
│   │   └── operations.ts       # Agregar deleteVersion, deleteAllNotes
│   ├── stores/
│   │   ├── notesStore.ts       # URL sync, seed data, deleteVersion, deleteAllNotes
│   │   ├── uiStore.ts          # showSettings, author management
│   │   └── localeStore.ts      # NUEVO: locale state + useT hook
│   ├── i18n/
│   │   ├── index.ts            # NUEVO: hook useT, locale detection
│   │   ├── es.ts               # NUEVO: traducciones español
│   │   └── en.ts               # NUEVO: traducciones inglés
│   ├── hooks/
│   │   └── useUrlSync.ts       # NUEVO: sincronización URL ↔ store
│   ├── components/
│   │   ├── note/
│   │   │   ├── NoteEditor.tsx  # Botón "?" markdown help, visor versión read-only, autor display
│   │   │   └── NoteCard.tsx    # Estilo crumpled en papelera, animación crumple, fuego
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Settings button, i18n toggle, fire button
│   │   │   └── NoteGrid.tsx    # Animación fuego en borrar todo
│   │   ├── settings/
│   │   │   ├── StorageIndicator.tsx # Sin cambios
│   │   │   └── SettingsModal.tsx    # NUEVO: modal con menú lateral + Perfil + Idioma
│   │   └── sidebar/
│   │       └── SearchBar.tsx   # Placeholder traducido
│   ├── styles/
│   │   └── design-system.css   # .crumpled, crumple anim, fuego anim, checkbox styles
│   └── index.html              # SVG favicon link
```

## I18N Complexity

El i18n requiere envolver todas las cadenas visibles con `t()`. Estrategia:
- **Componentes nuevos**: usan `t()` desde el inicio
- **Componentes existentes**: reemplazar cadenas hardcodeadas con `t()` — ~50-80 cadenas en total
- **Archivos de traducción**: `es.ts` y `en.ts` con estructura de keys anidadas (ej. `header.search_placeholder`)
- **Store**: `localeStore.ts` con Zustand, persiste en IndexedDB via `setSetting('app:locale', value)`

## Complexity Tracking

Sin violaciones — extensiones incrementales sobre estructura existente.
Mayor complejidad: i18n (envolver ~80 cadenas), animación fuego con partículas CSS.

### Bugfixes (Phase 17-18, sesión actual)
- `deleteAllNotes()` ya no toca settings — evita pérdida de tema/viewMode/autor post-borrado
- URL inválida valida UUID contra `notes`/`trashNotes` tras carga — toast rojo "Nota no encontrada"
- `getCurrentPosition()` fire-and-forget en `addNote`/`updateNote` — elimina bloqueo de 5s que impedía crear notas post-Borrar Todo
- `addNote` con try/catch + retry — si IndexedDB falla, recarga notas y reintenta
- FAB button con try/catch + toast error — feedback visible al usuario en lugar de silencio

## Critical Context (updated)
- `deleteAllNotes()` en `db/operations.ts` ya no hace `db.clear('settings')`
- `deleteAllNotes` en store también resetea `activeNoteId: null`
- `useUrlSync.ts` ya no setea `activeNoteId` inmediatamente en mount — se difiere hasta que `loading` es false
- `addNote` y `updateNote` en `notesStore.ts` usan `getCurrentPosition().then(...)` fire-and-forget
- `addNote` envuelto en try/catch con recarga + retry automático
- FAB "+" en App.tsx con try/catch local + `checkDBIntegrity()` — si la DB está corrupta, activa repair UI
- Repair UI overlay con botón "Reparar y reiniciar" — llama `emergencyReset()` (elimina IndexedDB), reseeds
- `checkDBIntegrity()` en operations.ts — test de lectura, retorna `{ ok, error? }`
- `emergencyReset()` — cierra DB, llama `indexedDB.deleteDatabase`, recrea en próxima operación
