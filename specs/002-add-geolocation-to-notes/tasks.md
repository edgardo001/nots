# Tasks: Geolocalización en Notas

**Input**: Design documents from `/specs/002-add-geolocation-to-notes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks are ordered by implementation dependency.

---

## Phase 1: Types y Utilidades

**Purpose**: Base types and utility before any logic changes

- [ ] T101 Extend Note type with `createdLat`, `createdLng`, `updatedLat`, `updatedLng` (optional, number | null) in `src/frontend/src/types/index.ts`
- [ ] T102 Extend NoteVersion type with `lat`, `lng` (optional, number | null) in `src/frontend/src/types/index.ts`
- [ ] T103 Create `getCurrentPosition()` utility wrapper in `src/frontend/src/utils/geolocation.ts` with timeout, error handling, and Position type export

---

## Phase 2: DB Layer

**Purpose**: Update persistence to accept/store geolocation fields

- [ ] T104 Update `addNote` in `src/frontend/src/db/operations.ts` to accept and store `createdLat`/`createdLng`/`updatedLat`/`updatedLng`
- [ ] T105 Update `updateNote` in `src/frontend/src/db/operations.ts` to accept and store `updatedLat`/`updatedLng`
- [ ] T106 Update `addVersion` in `src/frontend/src/db/operations.ts` to accept and store `lat`/`lng`
- [ ] T107 Update `getVersions` return type to include new geolocation fields in `src/frontend/src/db/operations.ts`

---

## Phase 3: Store Layer

**Purpose**: Wire geolocation capture into store actions

- [ ] T108 Update `notesStore.addNote` in `src/frontend/src/stores/notesStore.ts` to capture geolocation via `getCurrentPosition()` and pass to `dbAddNote`
- [ ] T109 Update `notesStore.updateNote` in `src/frontend/src/stores/notesStore.ts` to capture geolocation on content/title changes and pass to `dbUpdateNote`
- [ ] T110 Update `notesStore.saveVersion` in `src/frontend/src/stores/notesStore.ts` to capture geolocation and pass to `dbAddVersion`
- [ ] T111 Update `notesStore.forkFromVersion` in `src/frontend/src/stores/notesStore.ts` to capture geolocation for the new note

---

## Phase 4: UI

**Purpose**: Show geolocation information in the interface

- [ ] T112 Show geolocation indicator in NoteEditor (coordinates or icon) when available in `src/frontend/src/components/note/NoteEditor.tsx`
- [ ] T113 Show geolocation per version in version history panel in `src/frontend/src/components/note/NoteEditor.tsx`
- [ ] T114 Add location icon/tooltip to NoteCard when coordinates exist in `src/frontend/src/components/note/NoteCard.tsx`

---

## Phase 5: Tests

**Purpose**: Verify geolocation capture and fallback behavior

- [ ] T115 Write unit test for `getCurrentPosition` utility in `src/frontend/src/utils/geolocation.test.ts`
- [ ] T116 Update notesStore tests to cover geolocation capture on create, update, version, and fork in `src/frontend/src/stores/notesStore.test.ts`

---

## Dependencies

- **Phase 1** (types/utils): No dependencies — start first
- **Phase 2** (DB): Depends on Phase 1
- **Phase 3** (store): Depends on Phase 2
- **Phase 4** (UI): Depends on Phase 3
- **Phase 5** (tests): Can run after Phase 3

## Implementation Strategy

Implement phases in order. Each phase is independently testable:
- Phase 1: Verify types compile ✓
- Phase 2: Verify IndexedDB stores coordinates ✓
- Phase 3: Verify store captures coordinates on actions ✓
- Phase 4: Verify UI shows coordinates ✓
- Phase 5: Verify all with automated tests ✓
