import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Note, NoteVersion } from '../types'

const { mockNotes, mockTrash, getCurrentPositionMock, mockAddNote, mockUpdateNote, mockAddVersion } = vi.hoisted(() => {
  const mNotes: Note[] = [
    { id: '1', title: 'Beta', content: '# Beta', tags: ['work'], color: '#FFE4B5', emoji: '📝', folder: 'default', createdAt: '2026-06-10T10:00:00Z', updatedAt: '2026-06-12T12:00:00Z', deletedAt: null, position: 0 },
    { id: '2', title: 'Alpha', content: 'Alpha', tags: ['personal'], color: '#FFE4B5', emoji: '📝', folder: 'default', createdAt: '2026-06-09T10:00:00Z', updatedAt: '2026-06-11T12:00:00Z', deletedAt: null, position: 1 },
  ]
  const mTrash: Note[] = [
    { id: '3', title: 'Trashed', content: 'old', tags: [], color: '#FFE4B5', emoji: '📝', folder: 'default', createdAt: '2026-06-01T10:00:00Z', updatedAt: '2026-06-02T12:00:00Z', deletedAt: '2026-06-13T10:00:00Z', position: 2 },
  ]

  return {
    mockNotes: mNotes,
    mockTrash: mTrash,
    getCurrentPositionMock: vi.fn(() => Promise.resolve({ lat: 19.4326, lng: -99.1332 })),
    mockAddNote: vi.fn((partial?: Partial<Note>) => Promise.resolve({
      id: 'new-1', title: partial?.title ?? '', content: partial?.content ?? '',
      tags: [] as string[], color: '#FFE4B5', emoji: '📝', folder: 'default',
      createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T10:00:00Z',
      deletedAt: null, position: 2,
      createdLat: partial?.createdLat, createdLng: partial?.createdLng,
      updatedLat: partial?.updatedLat, updatedLng: partial?.updatedLng,
    })),
    mockUpdateNote: vi.fn((_id: string, data: Partial<Note>) => Promise.resolve({ ...mNotes[0], ...data })),
    mockAddVersion: vi.fn(() => Promise.resolve({ id: 'v1', noteId: '1', title: 'v1', content: 'v1', versionNumber: 1, savedAt: '2026-06-13T10:00:00Z' })),
  }
})

vi.mock('../utils/geolocation', () => ({
  getCurrentPosition: getCurrentPositionMock,
}))

vi.mock('../db/operations', () => ({
  getAllNotes: vi.fn(() => Promise.resolve(mockNotes)),
  getTrashedNotes: vi.fn(() => Promise.resolve(mockTrash)),
  addNote: mockAddNote,
  updateNote: mockUpdateNote,
  deleteNote: vi.fn(() => Promise.resolve()),
  permanentlyDeleteNote: vi.fn(() => Promise.resolve()),
  restoreNote: vi.fn(() => Promise.resolve(mockTrash[0])),
  addVersion: mockAddVersion,
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

  it('addNote captures geolocation when available', async () => {
    useNotesStore.setState({ notes: [] })
    mockAddNote.mockClear()
    await useNotesStore.getState().addNote()
    expect(mockAddNote).toHaveBeenCalledWith({
      createdLat: 19.4326, createdLng: -99.1332,
      updatedLat: 19.4326, updatedLng: -99.1332,
    })
  })

  it('updateNote captures geolocation on update', async () => {
    useNotesStore.setState({ notes: mockNotes })
    mockUpdateNote.mockClear()
    await useNotesStore.getState().updateNote('1', { title: 'Updated' })
    expect(mockUpdateNote).toHaveBeenCalledWith('1', expect.objectContaining({
      title: 'Updated',
      updatedLat: 19.4326,
      updatedLng: -99.1332,
    }))
  })

  it('saveVersion captures geolocation', async () => {
    mockAddVersion.mockClear()
    await useNotesStore.getState().saveVersion('1', 'Title', 'Content')
    expect(mockAddVersion).toHaveBeenCalledWith(expect.objectContaining({
      noteId: '1',
      title: 'Title',
      content: 'Content',
      lat: 19.4326,
      lng: -99.1332,
    }))
  })

  it('forkFromVersion captures geolocation', async () => {
    mockAddNote.mockClear()
    const version: NoteVersion = {
      id: 'v1', noteId: '1', title: 'Original',
      content: 'Content', savedAt: '2026-06-13T10:00:00Z',
      versionNumber: 1,
    }
    await useNotesStore.getState().forkFromVersion(version)
    expect(mockAddNote).toHaveBeenCalledWith({
      title: 'Original (fork)',
      content: 'Content',
      createdLat: 19.4326, createdLng: -99.1332,
      updatedLat: 19.4326, updatedLng: -99.1332,
    })
  })
})
