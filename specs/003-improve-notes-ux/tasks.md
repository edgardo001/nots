# Tasks: Mejoras UX/URL/Markdown en Notas

**Input**: Design documents from `/specs/003-improve-notes-ux/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks are ordered by implementation dependency.

---

## Phase 1: URL Sync (note UUID + search query)

**Purpose**: Sincronizar estado de la aplicación con la URL del navegador

- [x] T101 Create `useUrlSync` hook in `src/frontend/src/hooks/useUrlSync.ts` — reads URL params on mount, writes URL on state change, handles `popstate`
- [x] T102 Wire `useUrlSync` into `App.tsx` — initializes URL restore after store load
- [x] T103 Update `notesStore.setActiveNote` to push URL change with `?note=<uuid>`
- [x] T104 Update `notesStore.setSearchQuery` to push URL change with `?q=<encoded>`
- [x] T105 Handle `popstate` event — when note is open, save and close (Android back button); push history state on note open
- [x] T106 Add `saveRef` pattern in `App.tsx` — expose save function from NoteEditor via ref so popstate handler can save before closing

---

## Phase 2: Markdown Task Lists

**Purpose**: Renderizar correctamente checkboxes `[ ]` y `[x]` en preview markdown

- [x] T201 Configure `remark-gfm` task lists in `NoteEditor.tsx` (react-markdown already imports remark-gfm)
- [x] T202 Add CSS styles for markdown checkboxes (`.task-list-item`, `input[type="checkbox"]`) in `design-system.css` — read-only, styled as custom checkboxes

---

## Phase 3: Drag & Drop Improvement

**Purpose**: Evitar superposición de notas durante el arrastre

- [x] T301 Update `NoteGrid.tsx` drag configuration — set `DragOverlay` with proper z-index, use `rectSortingStrategy` with `useDndMonitor` for live position feedback
- [x] T302 Ensure `NoteCard.tsx` sortable uses proper `transition` during drag to prevent visual overlap

---

## Phase 4: Markdown Help "?"

**Purpose**: Botón de ayuda con cheat sheet de sintaxis markdown (movido a navbar como modal)

- [x] T401 Add "?" button in navbar as SVG icon (help circle)
- [x] T402 Create markdown cheat sheet modal con grid layout de 2 columnas (code + descripción)
- [x] T403 Remove old "?" popover from NoteEditor (both mobile and desktop toolbar)
- [x] T404 Fix dark mode visibility — usa `var(--text)` en navbar, modal con `var(--surface)` background

---

## Phase 5: Trash Crumpled Style & Animation

**Purpose**: Estilo visual de hoja arrugada para papelera + animación al eliminar

- [x] T501 Add SVG filter for crumpled paper texture injected via JS in `App.tsx`
- [x] T502 Add `@keyframes crumpleOut` animation for delete transition in `design-system.css`
- [x] T503 Update `NoteCard.tsx` to apply crumpled filter when note is trashed (`deletedAt !== null`)
- [x] T504 Update `NoteCard.tsx` delete handler to play crumple animation before calling `deleteNote`
- [x] T505 Show crumpled style on trashed notes in trash view

---

## Phase 6: Settings Modal with Profile/Author

**Purpose**: Modal de configuración con sección "Perfil" para ingresar autor

- [x] T601 Create `SettingsModal.tsx` in `src/frontend/src/components/settings/` — modal overlay con menú lateral izquierdo y contenido derecho
- [x] T602 Add "Perfil" section with "Autor" text input — reads/writes `app:author` via `setSetting`/`getSetting`
- [x] T603 Add `author` field to `Note` type in `src/frontend/src/types/index.ts` (optional, `string | null`)
- [x] T604 Update `notesStore.addNote` to read author from settings and assign to new note
- [x] T605 Update `notesStore.updateNote` to read author from settings and assign on edit
- [x] T606 Wire Settings button in `Header.tsx` — gear SVG icon → opens SettingsModal
- [x] T607 Add `showSettings` toggle in `uiStore.ts`
- [x] T608 Display author label in `NoteEditor.tsx` and `NoteCard.tsx` when author is set

---

## Phase 7: Version History — Delete Specific Version

**Purpose**: Permitir eliminar una versión individual del historial

- [x] T701 Add `deleteVersion(id: string)` function in `src/frontend/src/db/operations.ts`
- [x] T702 Add `deleteVersion` action in `notesStore.ts`
- [x] T703 Add delete button per version in version history panel (`NoteEditor.tsx`) with confirmation

---

## Phase 8: Version History — Read-Only Viewer

**Purpose**: Click en versión para ver contenido completo en solo lectura

- [x] T801 Add state `selectedVersionId` in version panel (`NoteEditor.tsx`)
- [x] T802 On version click, expand/render full content with `react-markdown` in read-only mode below the version entry
- [x] T803 Keep Fork/Restore buttons visible in the read-only view
- [x] T804 Toggle close on click again or close button

---

## Phase 9: Seed Data (5 notas de ejemplo)

**Purpose**: Crear notas de demostración automáticas en el primer ingreso

- [x] T901 Define static array of 5 sample Note objects in `db/operations.ts`
- [x] T902 Add `seedSampleNotes()` function — `addNote()` for each sample
- [x] T903 Add `sessionStorage` guard flag to prevent double-seed from BroadcastChannel sync
- [x] T904 Wire seed in `App.tsx` — call after initial `loadNotes()` if notes.length === 0

---

## Phase 10: Borrar Todo con Fuego

**Purpose**: Botón para destrucción total con doble confirmación y animación de fuego

- [x] T1001 Add `deleteAllNotes()` function in `src/frontend/src/db/operations.ts` — clears all 4 object stores
- [x] T1002 Add `deleteAllNotes` action in `notesStore.ts` — sets state to empty arrays
- [x] T1003 Create two-step confirmation dialog component or inline in `Header.tsx` — first "¿Estás seguro?", second "Esto es irreversible, ¿continuar?"
- [x] T1004 Add `@keyframes burnOut` CSS animation in `design-system.css` — color shift to orange/black, fire hue-rotate/saturate
- [x] T1005 Add fire particle effect — 🔥 emoji overlay + orange gradient + `@keyframes fireRise`
- [x] T1006 Wire `NoteGrid.tsx` to apply `burnOut` animation + fire particles to all cards before calling `deleteAllNotes()`
- [x] T1007 Add "Borrar Todo" button in Header (visible only when notes exist, with SVG trash icon)
- [x] T1008 Fix: cambiar background de ambos pasos de confirmación a `var(--accent)`

---

## Phase 11: I18N (Español / English)

**Purpose**: Internacionalización completa de la interfaz

- [ ] T1101 Create `src/frontend/src/i18n/es.ts` — all Spanish translations
- [ ] T1102 Create `src/frontend/src/i18n/en.ts` — all English translations
- [ ] T1103 Create `src/frontend/src/i18n/index.ts` — `useT()` hook reading from `localeStore`
- [ ] T1104 Create `src/frontend/src/stores/localeStore.ts` — Zustand store with `locale: 'es' | 'en'`, persists via `setSetting('app:locale', value)`
- [ ] T1105 Add locale detection on init: `navigator.language.startsWith('es') ? 'es' : 'en'`
- [ ] T1106 Wire `useT()` into all components — Header, Sidebar, NoteEditor, NoteCard, SearchBar, NoteGrid, Settings, Modals, StorageIndicator
- [ ] T1107 Add language selector in SettingsModal (Profile section or new "Idioma" section)
- [ ] T1108 Add language toggle to Header (globe icon button cycles es/en)

---

## Phase 12: Editor UX Polish (Save button, mobile tags, random emoji)

**Purpose**: Pequeñas mejoras de usabilidad en el editor

- [x] T1201 Replace close button (X icon) with save button (floppy disk icon, green background) in both mobile and desktop toolbar variants in `NoteEditor.tsx` — calls `save()` then `setActiveNote(null)`
- [x] T1202 Add `enterKeyHint="done"` and `inputMode="search"` to tag input in `NoteEditor.tsx` for mobile keyboard; handle `e.key === 'Done'` and `e.key === 'Go'` alongside `Enter`
- [x] T1203 Change default emoji from hardcoded `'📝'` to random selection in `db/operations.ts` — create `DEFAULT_EMOJIS` array with 20+ emojis and `randomEmoji()` function
- [x] T1204 Persist `viewMode` to IndexedDB via `setSetting('app:viewMode', mode)` on change in `notesStore.setViewMode`
- [x] T1205 Load `viewMode` from IndexedDB via `getSetting('app:viewMode')` in `notesStore.loadNotes` or on app init

---

## Phase 13: Favicon

**Purpose**: Favicon personalizado para la app

- [x] F1301 Create `src/frontend/public/favicon.svg` — SVG post-it icon (yellow note with folded corner)
- [x] F1302 Add `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` in `index.html`

---

## Phase 14: Iconos SVG (sesión actual)

**Purpose**: Reemplazar emojis por iconos SVG en toda la UI

- [x] T1401 Settings button ⚙️ → SVG gear icon (mobile menu + desktop nav)
- [x] T1402 Borrar Todo 🔥 → SVG trash icon (mobile menu + desktop nav)
- [x] T1403 Markdown help ? ? → SVG help circle icon (mobile menu + desktop nav)

---

## Phase 15: Correcciones papelera (sesión actual)

**Purpose**: Bugfixes para visualización y eliminación de notas en papelera

- [x] T1501 Fix `activeNote` lookup in `App.tsx` — buscar también en `trashNotes`
- [x] T1502 Fix `note` lookup in `NoteEditor.tsx` — buscar también en `trashNotes`
- [x] T1503 Fix delete button in NoteEditor — usar `permanentlyDeleteNote` si `note.deletedAt` es true
- [x] T1504 Add `emptyTrash` action to `notesStore` + button FAB "Vaciar papelera" con modal confirm
- [x] T1505 Seed colors corregidos para coincidir con `NOTE_COLORS` de NoteCard

---

## Phase 16: Animación fuego mejorada (sesión actual)

**Purpose**: Hacer visible el efecto de fuego al borrar todo

- [x] T1601 Add `@keyframes fireRise` en `design-system.css`
- [x] T1602 Add 🔥 emoji particles + orange gradient overlay en `NoteCard.tsx` cuando `burning` es true
- [x] T1603 Apply fire overlay en ambas vistas (postit + list)

---

## Phase 17: Bugfixes post-Borrar Todo & URL inválida

**Purpose**: Correcciones críticas reportadas después de pruebas con Borrar Todo y URLs manuales

- [x] T1701 Fix `deleteAllNotes` no debe borrar settings — remover `db.clear('settings')` para preservar tema, viewMode, locale, autor
- [x] T1702 Fix URL inválida `?note=<uuid>` no causa pantalla negra — `useUrlSync` ya no setea `activeNoteId` inmediatamente; validar en App.tsx tras cargar notas, mostrar toast error si UUID no existe
- [x] T1703 Fix `getCurrentPosition()` no bloquea `addNote`/`updateNote` — geolocalización pasa a fire-and-forget con `.then()`, la nota se crea/edita sin esperar

---

## Phase 18: Error recovery & resiliencia móvil

**Purpose**: Hacer la app robusta ante estados corruptos en dispositivos móviles

- [x] T1801 `deleteAllNotes` en store resetea `activeNoteId: null` — estado limpio post-borrado
- [x] T1802 `addNote` envuelto en try/catch — on error, recarga notas y reintenta
- [x] T1803 FAB button onClick con try/catch — muestra toast de error si falla
- [x] T1804 `checkDBIntegrity()` + `emergencyReset()` en operations.ts — detecta DB corrupta, elimina y recrea
- [x] T1805 Repair UI overlay en App.tsx — se muestra automáticamente si la DB está corrupta al iniciar
- [x] T1806 Init effect con try/catch — si `loadNotes` falla, verifica integridad y muestra repair
- [x] T1807 FAB try/catch detecta DB corrupta y activa repair automáticamente

---

## Phase 19: Markdown help en NoteEditor + cerrar sin guardar + sidebar fix

**Purpose**: Mover ayuda markdown al editor con inserción de código, agregar botón X para cerrar sin guardar, corregir centrado del toggle sidebar en mobile

- [x] T1901 Remover botón "?" y modal de ayuda markdown de Header.tsx (desktop + mobile menu)
- [x] T1902 Agregar botón "?" en toolbar de NoteEditor (desktop + mobile) que abre modal de ayuda
- [x] T1903 Modal de ayuda con botones clickeables: al hacer click en un ejemplo, se inserta el código Markdown en el contenido de la nota (vía `insertAtCursor`) y se cierra el modal
- [x] T1904 Agregar `contentRef` en textarea + `insertAtCursor()` para inserción precisa en posición del cursor
- [x] T1905 Agregar botón "X" (cerrar sin guardar) en toolbar de NoteEditor (desktop + mobile) — llama `setActiveNote(null)` sin `save()`
- [x] T1906 Fix sidebar toggle: cambiar de `position: 'absolute'` a `position: 'fixed'` en mobile para que `top: 50%` sea relativo al viewport, no al contenedor

## Dependencies

- **Phase 1** (URL sync): No dependencies — start first
- **Phase 2** (task lists): No dependencies — can run in parallel with Phase 1
- **Phase 3** (drag & drop): No dependencies — can run in parallel
- **Phase 4** (markdown help): Depends on Phase 2 conceptually but code is independent
- **Phase 5** (crumple style): Depends on understanding NoteCard — can run semi-independent
- **Phase 6** (settings): No dependencies — new component + store wiring
- **Phase 7** (delete version): Depends on Phase 8 for UI integration
- **Phase 8** (version viewer): No dependencies — pure UI change
- **Phase 9** (seed data): No dependencies — data layer only
- **Phase 10** (borrar todo): Depends on Phase 5 for animation patterns
- **Phase 11** (i18n): Wide dependency — touches every component, best done after most UI changes
- **Phase 12** (editor polish): No dependencies — pure UI
- **Phase 13** (favicon): No dependencies — pure assets

## Implementation Strategy

Orden recomendado:
1. Phase 1 (URL sync) + Phase 2 (task lists) + Phase 3 (drag) + Phase 6 (settings)
2. Phase 4 (markdown help) + Phase 5 (crumple) + Phase 9 (seed data) + Phase 10 (borrar todo)
3. Phase 8 (version viewer) + Phase 7 (delete version) + Phase 12 (editor polish) + Phase 13 (favicon)
4. Phase 11 (i18n) — last, wraps all strings across every component
