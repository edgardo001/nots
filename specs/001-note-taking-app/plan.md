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
src/
├── frontend/            # React 19 + Vite app
│   ├── app/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── NoteGrid.tsx
│   │   ├── note/
│   │   │   ├── NoteCard.tsx
│   │   │   ├── NoteEditor.tsx
│   │   │   └── NotePreview.tsx
│   │   ├── sidebar/
│   │   │   ├── NoteList.tsx
│   │   │   ├── SortControls.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── trash/
│   │   │   └── TrashView.tsx
│   │   ├── tags/
│   │   │   ├── TagManager.tsx
│   │   │   └── TagFilter.tsx
│   │   ├── settings/
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── StorageIndicator.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── ColorPicker.tsx
│   │       └── EmojiPicker.tsx
│   ├── stores/
│   │   ├── notesStore.ts
│   │   ├── uiStore.ts
│   │   └── trashStore.ts
│   ├── db/
│   │   ├── schema.ts
│   │   └── operations.ts
│   ├── utils/
│   │   ├── markdown.ts
│   │   ├── dates.ts
│   │   └── storage.ts
│   ├── types/
│   │   └── index.ts
│   └── hooks/
│       ├── useNotes.ts
│       ├── useSearch.ts
│       └── useDrag.ts
└── docker/              # Docker config
    ├── Dockerfile
    └── nginx.conf
```

## Complexity Tracking

Sin violaciones — la estructura es plana y se ajusta a los principios de la constitución.
