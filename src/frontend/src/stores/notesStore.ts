import { create } from 'zustand';
import type { Note, NoteVersion, ViewMode, SortField, SortOrder } from '../types';
import {
  getAllNotes,
  getTrashedNotes,
  addNote as dbAddNote,
  updateNote as dbUpdateNote,
  deleteNote as dbDeleteNote,
  permanentlyDeleteNote as dbPermanentDelete,
  restoreNote as dbRestoreNote,
  addVersion as dbAddVersion,
  getVersions as dbGetVersions,
} from '../db/operations';
import { getCurrentPosition } from '../utils/geolocation';

function sortNotes(notes: Note[], field: SortField, order: SortOrder): Note[] {
  const sorted = [...notes].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case 'title':
        cmp = a.title.localeCompare(b.title);
        break;
      case 'position':
        cmp = a.position - b.position;
        break;
      case 'createdAt':
        cmp = a.createdAt.localeCompare(b.createdAt);
        break;
      case 'updatedAt':
      default:
        cmp = a.updatedAt.localeCompare(b.updatedAt);
        break;
    }
    return order === 'desc' ? -cmp : cmp;
  });
  return sorted;
}

interface NotesState {
  notes: Note[];
  trashNotes: Note[];
  activeNoteId: string | null;
  loading: boolean;
  searchQuery: string;
  viewMode: ViewMode;
  sortField: SortField;
  sortOrder: SortOrder;

  loadNotes: () => Promise<void>;
  loadTrash: () => Promise<void>;
  addNote: () => Promise<string>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  permanentlyDeleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  setActiveNote: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  moveNote: (id: string, newPosition: number) => Promise<void>;
  saveVersion: (noteId: string, title: string, content: string) => Promise<void>;
  getVersions: (noteId: string) => Promise<NoteVersion[]>;
  restoreVersion: (noteId: string, version: NoteVersion) => Promise<void>;
  forkFromVersion: (version: NoteVersion) => Promise<string>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  trashNotes: [],
  activeNoteId: null,
  loading: true,
  searchQuery: '',
  viewMode: 'postit',
  sortField: 'updatedAt',
  sortOrder: 'desc',

  loadNotes: async () => {
    set({ loading: true });
    const { sortField, sortOrder } = get();
    const notes = await getAllNotes();
    set({ notes: sortNotes(notes, sortField, sortOrder), loading: false });
  },

  loadTrash: async () => {
    const notes = await getTrashedNotes();
    set({ trashNotes: notes });
  },

  addNote: async () => {
    const geo = await getCurrentPosition();
    const note = await dbAddNote(geo ? {
      createdLat: geo.lat, createdLng: geo.lng,
      updatedLat: geo.lat, updatedLng: geo.lng,
    } : undefined);
    const { sortField, sortOrder } = get();
    const notes = sortNotes([...get().notes, note], sortField, sortOrder);
    set({ notes, activeNoteId: note.id });
    return note.id;
  },

  updateNote: async (id: string, data: Partial<Note>) => {
    const geo = await getCurrentPosition();
    const updated = await dbUpdateNote(id, {
      ...data,
      ...(geo && { updatedLat: geo.lat, updatedLng: geo.lng }),
    });
    if (!updated) return;
    const { sortField, sortOrder } = get();
    const notes = sortNotes(
      get().notes.map(n => (n.id === id ? updated : n)),
      sortField,
      sortOrder
    );
    set({ notes });
  },

  deleteNote: async (id: string) => {
    await dbDeleteNote(id);
    const { activeNoteId } = get();
    set({
      notes: get().notes.filter(n => n.id !== id),
      activeNoteId: activeNoteId === id ? null : activeNoteId,
    });
  },

  permanentlyDeleteNote: async (id: string) => {
    await dbPermanentDelete(id);
    set({ trashNotes: get().trashNotes.filter(n => n.id !== id) });
  },

  restoreNote: async (id: string) => {
    await dbRestoreNote(id);
    const { sortField, sortOrder } = get();
    const notes = sortNotes(await getAllNotes(), sortField, sortOrder);
    set({ notes, trashNotes: get().trashNotes.filter(n => n.id !== id) });
  },

  setActiveNote: (id) => set({ activeNoteId: id }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setSortField: (field) => {
    set({ sortField: field });
    const { notes, sortOrder } = get();
    set({ notes: sortNotes(notes, field, sortOrder) });
  },

  setSortOrder: (order) => {
    set({ sortOrder: order });
    const { notes, sortField } = get();
    set({ notes: sortNotes(notes, sortField, order) });
  },

  moveNote: async (id: string, newPosition: number) => {
    const updated = await dbUpdateNote(id, { position: newPosition });
    if (!updated) return;
    const { sortField, sortOrder } = get();
    const notes = sortNotes(
      get().notes.map(n => (n.id === id ? updated : n)),
      sortField,
      sortOrder
    );
    set({ notes });
  },

  saveVersion: async (noteId: string, title: string, content: string) => {
    const geo = await getCurrentPosition();
    const versions = await dbGetVersions(noteId);
    const nextNum = versions.length > 0 ? versions[0].versionNumber + 1 : 1;
    await dbAddVersion({
      noteId,
      title,
      content,
      versionNumber: nextNum,
      savedAt: new Date().toISOString(),
      ...(geo && { lat: geo.lat, lng: geo.lng }),
    });
  },

  getVersions: async (noteId: string) => {
    return dbGetVersions(noteId);
  },

  restoreVersion: async (noteId: string, version: NoteVersion) => {
    const updated = await dbUpdateNote(noteId, { title: version.title, content: version.content });
    if (!updated) return;
    const { sortField, sortOrder } = get();
    const notes = sortNotes(
      get().notes.map(n => (n.id === noteId ? updated : n)),
      sortField,
      sortOrder
    );
    set({ notes });
  },

  forkFromVersion: async (version: NoteVersion) => {
    const geo = await getCurrentPosition();
    const note = await dbAddNote({
      title: `${version.title} (fork)`,
      content: version.content,
      ...(geo && { createdLat: geo.lat, createdLng: geo.lng, updatedLat: geo.lat, updatedLng: geo.lng }),
    });
    const { sortField, sortOrder } = get();
    const notes = sortNotes([...get().notes, note], sortField, sortOrder);
    set({ notes, activeNoteId: note.id });
    return note.id;
  },
}));
