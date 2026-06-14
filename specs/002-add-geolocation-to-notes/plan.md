# Implementation Plan: Geolocalización en Notas

**Branch**: `main` | **Date**: 2026-06-13 | **Spec**: `specs/002-add-geolocation-to-notes/spec.md`

**Input**: Feature specification from `specs/002-add-geolocation-to-notes/spec.md`

## Summary

Extender las entidades Note y NoteVersion con coordenadas de geolocalización capturadas mediante la Geolocation API del navegador. Las coordenadas se almacenan en IndexedDB (solo local, sin enviar a servidores). Se capturan al crear, modificar, guardar versión y hacer fork. Sin nuevas dependencias.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), React 19, Bun 1.3.14

**Primary Dependencies**: Geolocation API (navigator.geolocation) — nativa del navegador, zero dependencias

**Storage**: IndexedDB via `idb` — campos opcionales `createdLat`/`createdLng`/`updatedLat`/`updatedLng` en Note; `lat`/`lng` en NoteVersion

**Testing**: Vitest + Testing Library — mock de Geolocation API

**Target Platform**: Navegadores modernos (Chrome, Edge, Firefox, Safari) — cliente web

**Project Type**: Single Page Application (SPA) — frontend puro

**Performance Goals**: Captura de geolocalización en <1s. Sin bloqueo de UI (asíncrono)

**Constraints**: Sin nuevas dependencias externas. Datos solo locales. Fallback graceful si no hay permiso.

**Scale/Scope**: 1 feature, ~7 tareas incrementales

## Constitution Check

*GATE: All pass without violations.*

1. ✅ **Client-Side First** — Geolocation API es 100% navegador, sin servidor
2. ✅ **Privacidad y Datos Locales** — coordenadas solo en IndexedDB, no se envían a externos
3. ✅ **TypeScript Estricto** — tipos nuevos con opcionales para backward compat
4. ✅ **Licencias Open Source** — cero nuevas dependencias
5. ✅ **Calidad y Testing** — tests con mock de Geolocation API
6. ✅ **Accesibilidad WCAG AA** — sin cambios en UI que afecten accesibilidad
7. ✅ **PWA / Offline** — funciona offline (Geolocation API no requiere red en móviles con GPS)

## Project Structure

### Documentation (this feature)

```text
specs/002-add-geolocation-to-notes/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 research
├── data-model.md        # Phase 1 data model
└── quickstart.md        # Phase 1 validation guide
```

### Source Code (modified files)

```text
src/frontend/src/
├── types/
│   └── index.ts              # Extender Note y NoteVersion con lat/lng
├── db/
│   └── operations.ts          # Pasar coordenadas en create/update/version
├── stores/
│   └── notesStore.ts          # Capturar geolocalización en acciones
├── utils/
│   └── geolocation.ts         # Nueva utilidad: getCurrentPosition wrapper
├── components/
│   ├── note/
│   │   ├── NoteEditor.tsx     # Mostrar coordenadas en editor y versiones
│   │   └── NoteCard.tsx       # Indicador visual de ubicación
│   └── layout/
│   
```

## Complexity Tracking

Sin violaciones — extensión incremental sobre estructura existente.
