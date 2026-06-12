import { useEffect } from 'react'
import { useNotesStore } from '../stores/notesStore'

export function useKeyboardShortcuts() {
  const addNote = useNotesStore(s => s.addNote)
  const activeNoteId = useNotesStore(s => s.activeNoteId)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const deleteNote = useNotesStore(s => s.deleteNote)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isInput = (e.target as HTMLElement).tagName === 'INPUT'
        || (e.target as HTMLElement).tagName === 'TEXTAREA'
        || (e.target as HTMLElement).isContentEditable

      if (e.key === 'Escape' && activeNoteId) {
        e.preventDefault()
        setActiveNote(null)
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        addNote()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]')
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }
        return
      }

      if (e.key === 'Delete' && !isInput && !activeNoteId) {
        return
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [addNote, activeNoteId, setActiveNote, deleteNote])
}
