# Implementation Plan: Note-Taking App

**Branch**: `main` | **Date**: 2026-06-12 | **Spec**: `specs/001-note-taking-app/spec.md`

**Input**: Feature specification from `specs/001-note-taking-app/spec.md`

## Summary

Aplicación de notas estilo Post-It 100% frontend con React 19 + TypeScript + Bun. Persistencia en IndexedDB mediante `idb`, editor Markdown con vista previa, drag & drop con `@dnd-kit`, papelero con auto-eliminación a 7 días, historial de versiones, PWA para offline, y exportación/importación ZIP. Arquitectura cliente-only sin backend.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Bun 1.3.14

**Primary Dependencies**: React 19, Vite 6, Zustand, idb, react-markdown + remark-gfm, @dnd-kit/core, vite-plugin-pwa, date-fns, emoji-mart, rehype-highlight

**Storage**: IndexedDB con wrapper `idb` (3 object stores: notes, versions, attachments, settings)

**Testing**: Vitest + Testing Library (@testing-library/react)

**Target Platform**: Navegadores modernos (Chrome, Edge, Firefox, Safari) — cliente web

**Project Type**: Single Page Application (SPA) — frontend puro

**Performance Goals**: Carga inicial <3s, búsqueda entre 100 notas <1s, renderizado de grid con 50 notas sin lag

**Constraints**: Sin backend, sin autenticación, solo almacenamiento local del navegador, licencias open source exclusivamente

**Scale/Scope**: 1 proyecto, ~13 fases de desarrollo incremental

## Constitution Check

*GATE: Must pass before Phase 0 research.*

1. ✅ **Client-Side First** — app 100% frontend, sin servidor
2. ✅ **Privacidad y Datos Locales** — IndexedDB, sin datos a externos
3. ✅ **TypeScript Estricto** — strict: true, tipos explícitos
4. ✅ **Licencias Open Source** — todas las dependencias verificadas (MIT/Apache/BSD/ISC)
5. ✅ **Calidad y Testing** — Vitest + Testing Library planificados
6. ✅ **Accesibilidad WCAG AA** — ARIA labels, teclado, contraste
7. ✅ **PWA / Offline** — vite-plugin-pwa, offline-ready
8. ✅ **Stack Tecnológico** — React 19 + Vite + Bun + Zustand + idb

## Project Structure

### Documentation (this feature)

```text
specs/001-note-taking-app/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 research
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 validation guide
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code

```text
src/frontend/            # React 19 + Vite app
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root layout
│   ├── index.css                   # Global styles
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── index.ts                # Note, NoteVersion, Attachment, AppSettings
│   ├── db/
│   │   ├── schema.ts               # IndexedDB setup (idb)
│   │   └── operations.ts           # CRUD + trash purge + versioning + attachments
│   ├── stores/
│   │   ├── notesStore.ts           # Zustand: notes, trash, search, sort, versions
│   │   └── uiStore.ts              # Zustand: theme (light/dark/system), sidebar
│   ├── hooks/
│   │   └── useKeyboardShortcuts.ts # Global keyboard shortcuts
│   ├── styles/
│   │   └── design-system.css       # CSS custom properties + utility classes
│   └── components/
│       ├── layout/
│       │   ├── Header.tsx          # Logo, search, import/export, view/theme toggle
│       │   ├── Sidebar.tsx         # Sort, filters, tags, NoteList, trash toggle
│       │   └── NoteGrid.tsx        # Main content: postit grid + list view
│       ├── note/
│       │   ├── NoteCard.tsx        # Post-it card / list item
│       │   └── NoteEditor.tsx      # Full modal editor (preview, tags, versions, colors, emoji)
│       ├── sidebar/
│       │   ├── NoteList.tsx        # Sortable list items for sidebar
│       │   └── SearchBar.tsx       # Search input
│       └── settings/
│           └── StorageIndicator.tsx # Storage quota ring
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json
```

**Nota**: Componentes como NotePreview, SortControls, TrashView, TagManager, TagFilter, ThemeToggle, Button, Modal, ColorPicker, EmojiPicker están inlined dentro de sus padres. Los stores trashStore y hooks useNotes/useSearch/useDrag están inlined en notesStore/App.

## Complexity Tracking

Sin violaciones — la estructura es plana y se ajusta a los principios de la constitución.

## Mobile Responsiveness Learnings

### Sidebar Strategy
- El sidebar se posiciona con `position: absolute` y se desliza con `transform: translateX()`. 
- La pestaña de toggle debe estar FUERA del contenedor del sidebar para ser visible cuando el sidebar está oculto (`translateX(-280px)`).
- La pestaña se posiciona con `position: absolute; left: sidebarOpen ? 260 : 0` para que cuando el sidebar está abierto, la pestaña esté pegada a su borde derecho (el aside del Sidebar mide 260px).
- En escritorio el sidebar se abre automáticamente; en móvil se cierra por defecto.
- Detección de mobile via `useState(window.innerWidth < 768)` + `resize` listener.

### Mobile Modal Approach
- El modal del editor pasa a ser full-screen en móvil: `width: 100%; height: 100%; maxHeight: 100%; borderRadius: 0; boxShadow: none; padding: 16px`.
- El backdrop (`inset: 0`) ya está en su lugar.

### Header Responsive
- En desktop: [logo] [search] [controles visibles]
- En móvil: [logo] [search flex:1] [☰ colapsable con controles]
- Input search con `font-size: 16px` en móvil para evitar zoom automático de iOS.
- Search container `max-width: none` en móvil para que ocupe el espacio disponible.
- Altura del header reducida a 48px en móvil.

### Grid y Cards
- CSS Grid con `auto-fill, minmax(200px, 1fr)` reemplazó a `flex-wrap` para que las cards ocupen todo el ancho disponible.
- Cards cambian de `width: 220px` (fijo) a `width: 100%` (el grid controla el tamaño).

### Emojis en Móvil
- Algunos navegadores móviles no renderizan emojis con la font-family de Space Grotesk.
- Se agregó fallback: `font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`.
- Los botones emoji necesitan `line-height: 1` para evitar corte vertical.

### Logo SVG
- El emoji ⬛ no es escalable ni consistente entre plataformas.
- Se reemplazó por un SVG inline de 20x20 representando un documento (rect + líneas) que se adapta al `currentColor`.
