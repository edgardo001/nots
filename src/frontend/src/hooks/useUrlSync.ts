import { useEffect } from 'react'
import { useNotesStore } from '../stores/notesStore'

function buildUrl(activeNoteId: string | null, searchQuery: string): string {
  const url = new URL(window.location.href)
  if (activeNoteId) {
    url.searchParams.set('note', activeNoteId)
  } else {
    url.searchParams.delete('note')
  }
  if (searchQuery) {
    url.searchParams.set('q', searchQuery)
  } else {
    url.searchParams.delete('q')
  }
  return url.href
}

export function useUrlSync() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const query = params.get('q')
    if (query) {
      useNotesStore.getState().setSearchQuery(decodeURIComponent(query))
    }
  }, [])

  useEffect(() => {
    const unsub = useNotesStore.subscribe((state, prevState) => {
      if (state.activeNoteId !== prevState.activeNoteId || state.searchQuery !== prevState.searchQuery) {
        const newUrl = buildUrl(state.activeNoteId, state.searchQuery)
        history.replaceState(null, '', newUrl)
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const noteId = params.get('note')
      const query = params.get('q')
      const store = useNotesStore.getState()

      if (noteId && noteId !== store.activeNoteId) {
        const note = store.notes.find(n => n.id === noteId) || store.trashNotes.find(n => n.id === noteId)
        if (note) {
          store.setActiveNote(noteId)
        }
      } else if (!noteId && store.activeNoteId) {
        store.setActiveNote(null)
      }

      if (query !== null && query !== store.searchQuery) {
        store.setSearchQuery(decodeURIComponent(query))
      } else if (query === null && store.searchQuery) {
        store.setSearchQuery('')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
}
