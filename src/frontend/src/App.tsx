import './index.css'
import { useEffect, useState, useRef } from 'react'
import { useNotesStore } from './stores/notesStore'
import { useUIStore } from './stores/uiStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useUrlSync } from './hooks/useUrlSync'
import { deleteOldTrash, seedSampleNotes } from './db/operations'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import NoteGrid from './components/layout/NoteGrid'
import NoteEditor from './components/note/NoteEditor'
import SettingsModal from './components/settings/SettingsModal'

const SYNC_CHANNEL = 'notas-app-sync'

export default function App() {
  const loadNotes = useNotesStore(s => s.loadNotes)
  const activeNoteId = useNotesStore(s => s.activeNoteId)
  const notes = useNotesStore(s => s.notes)
  const trashNotes = useNotesStore(s => s.trashNotes)
  const activeNote = notes.find(n => n.id === activeNoteId) || trashNotes.find(n => n.id === activeNoteId)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const resolvedTheme = useUIStore(s => s.resolvedTheme)
  const loadTheme = useUIStore(s => s.loadTheme)
  const sidebarOpen = useUIStore(s => s.sidebarOpen)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)
  const toggleSidebar = useUIStore(s => s.toggleSidebar)
  const loading = useNotesStore(s => s.loading)
  const showTrash = useUIStore(s => s.showTrash)
  const showSettings = useUIStore(s => s.showSettings)
  const setShowSettings = useUIStore(s => s.setShowSettings)
  const addNote = useNotesStore(s => s.addNote)
  const deleteAllNotes = useNotesStore(s => s.deleteAllNotes)
  const emptyTrash = useNotesStore(s => s.emptyTrash)

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const [storageWarning, setStorageWarning] = useState(false)
  const [burning, setBurning] = useState(false)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState<'first' | 'second' | null>(null)
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const seededRef = useRef(false)
  const noteEditorSaveRef = useRef<(() => Promise<void>) | null>(null)

  useKeyboardShortcuts()
  useUrlSync()

  // Push history state when opening a note, handle Android back button
  useEffect(() => {
    if (activeNoteId) {
      history.pushState({ noteOpen: true }, '')
    }
  }, [activeNoteId])

  useEffect(() => {
    const handlePopState = () => {
      if (activeNoteId) {
        noteEditorSaveRef.current?.()
        setActiveNote(null)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [activeNoteId, setActiveNote])

  useEffect(() => {
    const init = async () => {
      await loadNotes()
      const { notes } = useNotesStore.getState()
      if (notes.length === 0 && !seededRef.current) {
        seededRef.current = true
        await seedSampleNotes()
        await loadNotes()
      }
    }
    init()
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
      if (!seededRef.current) {
        seededRef.current = true
      }
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

  const initialUrlRef = useRef(true)
  useEffect(() => {
    if (loading || !initialUrlRef.current) return
    initialUrlRef.current = false
    const params = new URLSearchParams(window.location.search)
    const noteId = params.get('note')
    const query = params.get('q')
    if (noteId) {
      const note = notes.find(n => n.id === noteId) || trashNotes.find(n => n.id === noteId)
      if (note) {
        setActiveNote(noteId)
      } else {
        setUrlError(`Nota no encontrada: ${noteId.slice(0, 8)}...`)
        setTimeout(() => setUrlError(null), 4000)
      }
    }
    if (query && !noteId) {
      const decoded = decodeURIComponent(query)
      const exists = notes.some(n =>
        n.title.toLowerCase().includes(decoded.toLowerCase()) ||
        n.content.toLowerCase().includes(decoded.toLowerCase())
      )
      if (!exists) {
        setUrlError(`Sin resultados para "${decoded}"`)
        setTimeout(() => setUrlError(null), 4000)
      }
    }
  }, [loading, notes, trashNotes, setActiveNote])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('style', 'display:none')
    svg.setAttribute('aria-hidden', 'true')
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
    filter.setAttribute('id', 'crumple')
    const feTurbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence')
    feTurbulence.setAttribute('type', 'fractalNoise')
    feTurbulence.setAttribute('baseFrequency', '0.04')
    feTurbulence.setAttribute('numOctaves', '4')
    feTurbulence.setAttribute('result', 'noise')
    const feDisplacement = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap')
    feDisplacement.setAttribute('in', 'SourceGraphic')
    feDisplacement.setAttribute('in2', 'noise')
    feDisplacement.setAttribute('scale', '3')
    feDisplacement.setAttribute('xChannelSelector', 'R')
    feDisplacement.setAttribute('yChannelSelector', 'Y')
    filter.appendChild(feTurbulence)
    filter.appendChild(feDisplacement)
    svg.appendChild(filter)
    document.body.appendChild(svg)
    return () => { svg.remove() }
  }, [])

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true)
    } else {
      setSidebarOpen(false)
    }
  }, [isMobile, setSidebarOpen])

  const handleBorrarTodo = () => {
    setShowDeleteAllConfirm('first')
  }

  const confirmDeleteAll = () => {
    setShowDeleteAllConfirm(null)
    setBurning(true)
    setTimeout(async () => {
      await deleteAllNotes()
      setBurning(false)
      await loadNotes()
    }, 800)
  }

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
      <Header isMobile={isMobile} onBorrarTodo={handleBorrarTodo} />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        
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
          overflow: 'visible',
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
          overflow: 'hidden',
          background: 'var(--bg)',
          paddingTop: 32,
          paddingBottom: 32,
          paddingRight: 32,
          paddingLeft: sidebarOpen ? 312 : 32,
          transition: 'padding-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <NoteGrid burning={burning} />
        </main>
      </div>

      {urlError && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 99999, background: '#c0392b', color: '#fff', padding: '12px 24px',
          borderRadius: 6, fontSize: 14, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {urlError}
        </div>
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showDeleteAllConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setShowDeleteAllConfirm(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', borderRadius: 8, overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)', width: '90%', maxWidth: 440,
            }}
          >
            <div style={{ padding: '24px 28px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                {showDeleteAllConfirm === 'first' ? '🔥 Borrar Todo' : '⚠️ Confirmación final'}
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {showDeleteAllConfirm === 'first'
                  ? '¿Estás seguro de que quieres borrar todas las notas? Esta acción no se puede deshacer.'
                  : 'Esto eliminará permanentemente TODAS las notas, versiones y configuraciones. ¿Estás absolutamente seguro?'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '20px 28px 24px' }}>
              <button
                onClick={() => setShowDeleteAllConfirm(null)}
                style={{
                  padding: '10px 20px', borderRadius: 6, border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                }}
              >
                Cancelar
              </button>
               <button
                onClick={() => {
                  if (showDeleteAllConfirm === 'first') setShowDeleteAllConfirm('second')
                  else confirmDeleteAll()
                }}
                style={{
                  padding: '10px 20px', borderRadius: 6, border: 'none',
                  background: 'var(--accent)',
                  color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}
              >
                {showDeleteAllConfirm === 'first' ? 'Sí, borrar todo' : 'Eliminar permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          onClick={() => { noteEditorSaveRef.current?.(); setActiveNote(null) }}
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
            <NoteEditor noteId={activeNoteId} isMobile={isMobile} saveRef={noteEditorSaveRef} />
          </div>
        </div>
      )}

      {showTrash && trashNotes.length > 0 && (
        <button
          onClick={() => setShowEmptyTrashConfirm(true)}
          aria-label="Vaciar papelera"
          title="Vaciar papelera"
          style={{
            position: 'fixed', bottom: 84, right: 20,
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--surface)', color: '#c0392b',
            border: '1px solid var(--border)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            fontSize: 20, zIndex: 100,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </button>
      )}
      {showEmptyTrashConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setShowEmptyTrashConfirm(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', borderRadius: 8, overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)', width: '90%', maxWidth: 400,
            }}
          >
            <div style={{ padding: '24px 28px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                Vaciar papelera
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                ¿Estás seguro de vaciar la papelera? Se eliminarán permanentemente {trashNotes.length} nota{trashNotes.length !== 1 ? 's' : ''}. Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '20px 28px 24px' }}>
              <button
                onClick={() => setShowEmptyTrashConfirm(false)}
                style={{
                  padding: '10px 20px', borderRadius: 6, border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await emptyTrash()
                  setShowEmptyTrashConfirm(false)
                }}
                style={{
                  padding: '10px 20px', borderRadius: 6, border: 'none',
                  background: 'var(--accent)',
                  color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}
              >
                Vaciar papelera
              </button>
            </div>
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
