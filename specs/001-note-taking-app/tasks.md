# Tasks: Note-Taking App (Post-It Style)

**Input**: Design documents from `/specs/001-note-taking-app/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Tests are OPTIONAL but required by the project's constitution for quality verification.

**Organization**: Tasks are grouped by setup, foundational, and user stories in priority order. Completed tasks are marked `[X]`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Vite + React 19 + TypeScript project in `src/frontend`
- [x] T002 Configure vanilla CSS, ESLint, and Prettier in `src/frontend`
- [x] T003 [P] Create initial `.gitignore` and `.dockerignore` files in repo root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T004 Setup database schema and object stores with `idb` in `src/frontend/src/db/schema.ts`
- [x] T005 Implement core database CRUD and versioning/attachment helpers in `src/frontend/src/db/operations.ts`
- [x] T006 Implement Zustand state store for notes and trash operations in `src/frontend/src/stores/notesStore.ts`
- [x] T007 Implement Zustand state store for UI theme and sidebar state in `src/frontend/src/stores/uiStore.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Crear y editar notas con Markdown (Priority: P1) 🎯 MVP

**Goal**: Create and edit notes with Markdown support, and toggle preview mode

**Independent Test**: Create notes, write markdown headers/formatting, view formatted preview, and check that content auto-saves on blur.

- [x] T008 [US1] Create NoteEditor component with Markdown and editing views in `src/frontend/src/components/note/NoteEditor.tsx`
- [x] T009 [US1] Add auto-save functionality to note store/db on title or content change in `src/frontend/src/components/note/NoteEditor.tsx`
- [x] T010 [US1] Configure react-markdown and remarkGfm to render Markdown formatting in preview mode in `src/frontend/src/components/note/NoteEditor.tsx`

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Organizar notas con Post-It y vista lista (Priority: P1)

**Goal**: Show notes in a Post-It style grid or a list view, with drag-and-drop ordering in both views

**Independent Test**: Drag and drop post-its/lists to change order, switch between post-it and list modes, and toggle sidebar open/closed.

- [x] T011 [US2] Implement NoteCard component for Post-It style grid layout in `src/frontend/src/components/note/NoteCard.tsx`
- [x] T012 [US2] Implement NoteGrid component with responsive flex/grid structure in `src/frontend/src/components/layout/NoteGrid.tsx`
- [x] T013 [US2] Create Sidebar component to list notes in a vertical list in `src/frontend/src/components/layout/Sidebar.tsx`
- [x] T014 [US2] Connect sidebar visibility with store's sidebarOpen state in `src/frontend/src/App.tsx`
- [x] T015 [US2] Add sidebar toggle button to Header component in `src/frontend/src/components/layout/Header.tsx`
- [x] T016 [US2] Implement drag-and-drop reordering for post-its in NoteGrid using @dnd-kit in `src/frontend/src/components/layout/NoteGrid.tsx`
- [x] T017 [US2] Implement drag-and-drop reordering for lists in Sidebar using @dnd-kit in `src/frontend/src/components/layout/Sidebar.tsx`

**Checkpoint**: User Stories 1 and 2 are fully functional and testable independently

---

## Phase 5: User Story 3 - Buscar y filtrar notas (Priority: P2)

**Goal**: Search notes in real-time and filter by tag, color, date range, or attachments

**Independent Test**: Enter text in search bar to filter notes immediately; click tags to filter notes.

- [x] T018 [US3] Create SearchBar component and connect it to header search input in `src/frontend/src/components/sidebar/SearchBar.tsx`
- [x] T019 [US3] Implement real-time note filtering by title, content, or tags in `src/frontend/src/components/layout/NoteGrid.tsx`
- [x] T020 [US3] Implement tag list and tag filtering UI in Sidebar in `src/frontend/src/components/layout/Sidebar.tsx`
- [ ] T021 [US3] Implement advanced filters in sidebar: color, date range, or presence of attachments in `src/frontend/src/components/layout/Sidebar.tsx`

---

## Phase 6: User Story 4 - Papelero y restauración (Priority: P2)

**Goal**: Move deleted notes to trash, restore them, or permanently delete them

**Independent Test**: Click delete on note, verify it disappears from active notes and shows in trash, click restore to bring it back.

- [x] T022 [US4] Implement delete/restore/permanent delete database and store actions in `src/frontend/src/stores/notesStore.ts`
- [x] T023 [US4] Add trash/restore buttons to NoteCard component in `src/frontend/src/components/note/NoteCard.tsx`
- [x] T024 [US4] Connect trash toggle button in Sidebar to load trashed notes in `src/frontend/src/components/layout/Sidebar.tsx`
- [ ] T025 [US4] Implement scheduling/background task to auto-delete notes older than 7 days from trash in `src/frontend/src/db/operations.ts`

---

## Phase 7: User Story 5 - Personalizar notas con color y emoji (Priority: P3)

**Goal**: Customize note color and emoji icon

**Independent Test**: Choose a different color or emoji from the pickers in the editor, and see the color/emoji update on the note card immediately.

- [x] T026 [US5] Implement color selector in NoteEditor component in `src/frontend/src/components/note/NoteEditor.tsx`
- [x] T027 [US5] Implement emoji picker in NoteEditor component in `src/frontend/src/components/note/NoteEditor.tsx`
- [x] T028 [US5] Render selected color and emoji icon on NoteCard component in `src/frontend/src/components/note/NoteCard.tsx`

---

## Phase 8: Additional features (Versions, Attachments, PWA, Import/Export)

**Goal**: Add version history, attachment handling, storage indicators, import/export, and offline support

**Independent Test**: Restore/fork from history, paste/upload an image to note and save to db, view storage indicator, import/export md files and ZIP.

- [x] T029 Implement version history UI in NoteEditor in `src/frontend/src/components/note/NoteEditor.tsx`
- [ ] T030 Implement database-backed image attachment uploads (ArrayBuffer) in NoteEditor using operations.ts in `src/frontend/src/components/note/NoteEditor.tsx`
- [x] T031 Create StorageIndicator component showing quota usage in `src/frontend/src/components/settings/StorageIndicator.tsx`
- [x] T032 Implement export to md and export all as ZIP in Header component in `src/frontend/src/components/layout/Header.tsx`
- [x] T033 Implement import md files and parse frontmatter yaml in Header component in `src/frontend/src/components/layout/Header.tsx`
- [x] T034 Configure PWA plugin and manifest.webmanifest in `src/frontend/vite.config.ts`

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T035 Implement key shortcuts hook in `src/frontend/src/hooks/useKeyboardShortcuts.ts`
- [ ] T036 Write unit tests for Zustand stores and DB operations in `src/frontend/src/stores/notesStore.test.ts`
- [ ] T037 Validate WCAG AA accessibility compliance in layout components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories
