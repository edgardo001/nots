import './index.css'
import { useEffect } from 'react'
import { useNotesStore } from './stores/notesStore'
import { useUIStore } from './stores/uiStore'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import NoteGrid from './components/layout/NoteGrid'
import NoteEditor from './components/note/NoteEditor'

export default function App() {
  const loadNotes = useNotesStore(s => s.loadNotes)
  const activeNoteId = useNotesStore(s => s.activeNoteId)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const resolvedTheme = useUIStore(s => s.resolvedTheme)
  const loadTheme = useUIStore(s => s.loadTheme)

  useEffect(() => {
    loadNotes()
    loadTheme()
  }, [loadNotes, loadTheme])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto', padding: 32, background: 'var(--bg)' }}>
          <NoteGrid />
        </main>
      </div>

      {activeNoteId && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.15s ease',
          }}
          onClick={() => setActiveNote(null)}
        >
          <div
            style={{
              background: 'var(--surface)', borderRadius: 16,
              padding: 24, maxWidth: 800, width: '90%', maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              animation: 'slideUp 0.2s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            <NoteEditor noteId={activeNoteId} />
          </div>
        </div>
      )}
    </div>
  )
}
