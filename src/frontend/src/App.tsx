import './index.css'
import { useEffect, useState, useRef } from 'react'
import { useNotesStore } from './stores/notesStore'
import { useUIStore } from './stores/uiStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { deleteOldTrash } from './db/operations'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import NoteGrid from './components/layout/NoteGrid'
import NoteEditor from './components/note/NoteEditor'

const SYNC_CHANNEL = 'notas-app-sync'

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
  const addNote = useNotesStore(s => s.addNote)

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const [storageWarning, setStorageWarning] = useState(false)

  useKeyboardShortcuts()

  useEffect(() => {
    loadNotes()
    loadTheme()
    deleteOldTrash(7)

    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(est => {
        if (est.usage != null && est.quota != null && (est.usage / est.quota) > 0.8) {
          setStorageWarning(true)
        }
      })
    }

    const channel = new BroadcastChannel(SYNC_CHANNEL)
    channelRef.current = channel
    channel.onmessage = () => {
      loadNotes()
      useUIStore.getState().loadTheme()
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      channel.close()
    }
  }, [loadNotes, loadTheme])

  useEffect(() => {
    const unsub = useNotesStore.subscribe(() => {
      channelRef.current?.postMessage('notes:updated')
    })
    return () => unsub()
  }, [])

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
      {storageWarning && (
        <div role="alert" style={{
          background: '#e85d3a', color: '#fff', padding: '8px 16px',
          fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <span>⚠️ Almacenamiento casi lleno. Considera exportar tus notas y eliminar las que no necesites.</span>
          <button
            onClick={() => setStorageWarning(false)}
            aria-label="Descartar advertencia"
            style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
              padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11,
            }}
          >
            X
          </button>
        </div>
      )}
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

        {/* Pestaña flotante para abrir/cerrar sidebar */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Esconder barra lateral' : 'Mostrar barra lateral'}
          aria-expanded={sidebarOpen}
          style={{
            position: 'absolute',
            left: sidebarOpen ? 260 : (isMobile ? 6 : 0),
            top: '50%',
            transform: 'translateY(-50%)',
            width: isMobile && !sidebarOpen ? 28 : 20,
            height: isMobile && !sidebarOpen ? 72 : 64,
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
            boxShadow: sidebarOpen ? '2px 0 8px rgba(0,0,0,0.04)' : '2px 0 12px rgba(0,0,0,0.08)',
            transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.1s, color 0.1s',
            opacity: sidebarOpen || !isMobile ? 1 : 0.85,
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
          <svg width={isMobile && !sidebarOpen ? 14 : 10} height={isMobile && !sidebarOpen ? 14 : 10} viewBox="0 0 10 10" fill="none" aria-hidden="true"
            style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M2 1L7 5L2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Overlay para cerrar sidebar al tocar fuera en móvil */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 97,
              background: 'rgba(0,0,0,0.25)',
            }}
          />
        )}

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
              padding: isMobile ? '12px 16px 16px' : '16px 24px 24px',
              maxWidth: isMobile ? '100%' : 800,
              width: '100%',
              maxHeight: isMobile ? '100%' : '85vh',
              height: isMobile ? '100%' : undefined,
              display: isMobile ? 'flex' : undefined,
              flexDirection: isMobile ? 'column' : undefined,
              overflow: 'hidden',
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

      <button
        onClick={addNote}
        aria-label="Crear nueva nota"
        style={{
          position: 'fixed', bottom: 20, right: 20,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--accent)', color: '#fff',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          fontSize: 24, zIndex: 100,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.3)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)' }}
      >
        +
      </button>
    </div>
  )
}
