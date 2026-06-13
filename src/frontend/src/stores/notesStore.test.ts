import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Note, NoteVersion } from '../types'

const mockNotes: Note[] = [
  { id: '1', title: 'Beta', content: '# Beta', tags: ['work'], color: '#FFE4B5', emoji: '📝', folder: 'default', createdAt: '2026-06-10T10:00:00Z', updatedAt: '2026-06-12T12:00:00Z', deletedAt: null, position: 0 },
  { id: '2', title: 'Alpha', content: 'Alpha', tags: ['personal'], color: '#FFE4B5', emoji: '📝', folder: 'default', createdAt: '2026-06-09T10:00:00Z', updatedAt: '2026-06-11T12:00:00Z', deletedAt: null, position: 1 },
]

const mockTrash: Note[] = [
  { id: '3', title: 'Trashed', content: 'old', tags: [], color: '#FFE4B5', emoji: '📝', folder: 'default', createdAt: '2026-06-01T10:00:00Z', updatedAt: '2026-06-02T12:00:00Z', deletedAt: '2026-06-13T10:00:00Z', position: 2 },
]

vi.mock('../db/operations', () => ({
  getAllNotes: vi.fn(() => Promise.resolve(mockNotes)),
  getTrashedNotes: vi.fn(() => Promise.resolve(mockTrash)),
  addNote: vi.fn(() => Promise.resolve({ id: 'new-1', title: '', content: '', tags: [], color: '#FFE4B5', emoji: '📝', folder: 'default', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z', deletedAt: null, position: 2 })),
  updateNote: vi.fn((_id: string, data: Partial<Note>) => Promise.resolve({ ...mockNotes[0], ...data })),
  deleteNote: vi.fn(() => Promise.resolve()),
  permanentlyDeleteNote: vi.fn(() => Promise.resolve()),
  restoreNote: vi.fn(() => Promise.resolve(mockTrash[0])),
  addVersion: vi.fn(() => Promise.resolve({ id: 'v1', noteId: '1', title: 'v1', content: 'v1', versionNumber: 1, savedAt: '2026-06-13T10:00:00Z' })),
  getVersions: vi.fn(() => Promise.resolve<NoteVersion[]>([])),
}))

import { useNotesStore } from './notesStore'

describe('notesStore', () => {
  beforeEach(() => {
    useNotesStore.setState({
      notes: [],
      trashNotes: [],
      activeNoteId: null,
      loading: true,
      searchQuery: '',
      viewMode: 'postit',
      sortField: 'updatedAt',
      sortOrder: 'desc',
    })
  })

  it('loadNotes loads and sorts notes', async () => {
    const store = useNotesStore.getState()
    await store.loadNotes()
    const state = useNotesStore.getState()
    expect(state.loading).toBe(false)
    expect(state.notes).toHaveLength(2)
    expect(state.notes[0].title).toBe('Beta')
  })

  it('addNote creates and selects a new note', async () => {
    useNotesStore.setState({ notes: mockNotes })
    const store = useNotesStore.getState()
    const id = await store.addNote()
    expect(id).toBe('new-1')
    const state = useNotesStore.getState()
    expect(state.activeNoteId).toBe('new-1')
    expect(state.notes).toHaveLength(3)
  })

  it('setActiveNote updates active note id', () => {
    useNotesStore.getState().setActiveNote('1')
    expect(useNotesStore.getState().activeNoteId).toBe('1')
    useNotesStore.getState().setActiveNote(null)
    expect(useNotesStore.getState().activeNoteId).toBeNull()
  })

  it('setSearchQuery updates search query', () => {
    useNotesStore.getState().setSearchQuery('test')
    expect(useNotesStore.getState().searchQuery).toBe('test')
  })

  it('setViewMode toggles view mode', () => {
    useNotesStore.getState().setViewMode('list')
    expect(useNotesStore.getState().viewMode).toBe('list')
  })

  it('setSortField re-sorts notes by title desc', async () => {
    const store = useNotesStore.getState()
    await store.loadNotes()
    useNotesStore.getState().setSortField('title')
    const state = useNotesStore.getState()
    expect(state.sortField).toBe('title')
    expect(state.notes[0].title).toBe('Beta')
    expect(state.notes[1].title).toBe('Alpha')
  })

  it('setSortOrder reverses order', async () => {
    const store = useNotesStore.getState()
    await store.loadNotes()
    useNotesStore.getState().setSortOrder('asc')
    const state = useNotesStore.getState()
    expect(state.sortOrder).toBe('asc')
    expect(state.notes[0].title).toBe('Alpha')
    expect(state.notes[1].title).toBe('Beta')
  })

  it('deleteNote moves note to trash and clears active if deleted', async () => {
    useNotesStore.setState({ notes: mockNotes, activeNoteId: '1' })
    await useNotesStore.getState().deleteNote('1')
    const state = useNotesStore.getState()
    expect(state.notes).toHaveLength(1)
    expect(state.activeNoteId).toBeNull()
  })

  it('restoreNote restores from trash', async () => {
    useNotesStore.setState({ trashNotes: mockTrash, notes: mockNotes })
    await useNotesStore.getState().restoreNote('3')
    const state = useNotesStore.getState()
    expect(state.trashNotes).toHaveLength(0)
  })

  it('permanentlyDeleteNote removes from trash', async () => {
    useNotesStore.setState({ trashNotes: mockTrash })
    await useNotesStore.getState().permanentlyDeleteNote('3')
    const state = useNotesStore.getState()
    expect(state.trashNotes).toHaveLength(0)
  })
})
