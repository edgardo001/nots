import './index.css'
import { useEffect, useState } from 'react'
import { useNotesStore } from './stores/notesStore'
import { useUIStore } from './stores/uiStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import NoteGrid from './components/layout/NoteGrid'
import NoteEditor from './components/note/NoteEditor'

export default function App() {
  const loadNotes = useNotesStore(s => s.loadNotes)
  const activeNoteId = useNotesStore(s => s.activeNoteId)
  const notes = useNotesStore(s => s.notes)
  const activeNote = notes.find(n => n.id === activeNoteId)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const resolvedTheme = useUIStore(s => s.resolvedTheme)
  const loadTheme = useUIStore(s => s.loadTheme)
  const sidebarOpen = useUIStore(s => s.sidebarOpen)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)
  const toggleSidebar = useUIStore(s => s.toggleSidebar)

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useKeyboardShortcuts()

  useEffect(() => {
    loadNotes()
    loadTheme()

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [loadNotes, loadTheme])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true)
    } else {
      setSidebarOpen(false)
    }
  }, [isMobile, setSidebarOpen])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header isMobile={isMobile} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        
        {/* Contenedor flotante del Sidebar con transición en sincronía con la pestaña */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '280px',
          zIndex: 98,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-280px)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          
        }}>
          <Sidebar />
        </div>

        {/* Pestaña flotante fuera del sidebar para que sea visible cuando está oculto */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Esconder barra lateral' : 'Mostrar barra lateral'}
          aria-expanded={sidebarOpen}
          style={{
            position: 'absolute',
            left: sidebarOpen ? 260 : 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '64px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderLeft: sidebarOpen ? 'none' : '1px solid var(--border)',
            color: 'var(--text)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99,
            padding: 0,
            fontSize: '9px',
            lineHeight: 1,
            boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
            transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.1s, color 0.1s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--accent)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--surface)'
            e.currentTarget.style.color = 'var(--text)'
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
            style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M2 1L7 5L2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Contenedor principal con padding dinámico para evitar solapamiento de notas */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          background: 'var(--bg)',
          paddingTop: 32,
          paddingBottom: 32,
          paddingRight: 32,
          paddingLeft: sidebarOpen ? 312 : 32,
          transition: 'padding-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <NoteGrid />
        </main>
      </div>

      {activeNoteId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Editor de nota"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
            zIndex: 1000, display: 'flex', alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.15s ease',
            padding: isMobile ? 0 : undefined,
          }}
          onClick={() => setActiveNote(null)}
        >
          <div
            style={{
              background: activeNote?.color ?? 'var(--surface)',
              borderRadius: isMobile ? 0 : 4,
              padding: isMobile ? 16 : 24,
              maxWidth: isMobile ? '100%' : 800,
              width: '100%',
              maxHeight: isMobile ? '100%' : '85vh',
              height: isMobile ? '100%' : undefined,
              overflowY: 'auto',
              boxShadow: isMobile ? 'none' : (activeNote?.color
                ? '0 24px 64px rgba(0,0,0,0.18), 0 2px 0 rgba(0,0,0,0.08) inset'
                : '0 20px 60px rgba(0,0,0,0.15)'),
              animation: 'slideUp 0.2s ease',
              borderTop: activeNote?.color ? '4px solid rgba(0,0,0,0.06)' : 'none',
              color: activeNote?.color ? '#1a1a1a' : undefined,
            }}
            onClick={e => e.stopPropagation()}
          >
            <NoteEditor noteId={activeNoteId} isMobile={isMobile} />
          </div>
        </div>
      )}
    </div>
  )
}
