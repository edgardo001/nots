import { useState, useEffect, useCallback, useRef, createRef } from 'react'
import { useNotesStore } from '../../stores/notesStore'
import { useUIStore, themeCycle } from '../../stores/uiStore'
import SearchBar from '../sidebar/SearchBar'

export function noteToMarkdown(note: { title: string; content: string; tags: string[]; emoji: string; color: string; createdAt: string; updatedAt: string }): string {
  const frontmatter = [
    '---',
    `title: "${note.title.replace(/"/g, '\\"')}"`,
    `emoji: ${note.emoji}`,
    `color: ${note.color}`,
    `tags: [${note.tags.join(', ')}]`,
    `created: ${note.createdAt}`,
    `updated: ${note.updatedAt}`,
    '---',
  ].join('\n')
  return `${frontmatter}\n\n${note.content}`
}

interface HeaderProps {
  isMobile?: boolean
  onBorrarTodo?: () => void
}

export default function Header({ isMobile, onBorrarTodo }: HeaderProps) {
  const viewMode = useNotesStore(s => s.viewMode)
  const setViewMode = useNotesStore(s => s.setViewMode)
  const notes = useNotesStore(s => s.notes)
  const theme = useUIStore(s => s.theme)
  const setTheme = useUIStore(s => s.setTheme)
  const [menuOpen, setMenuOpen] = useState(false)
  const [markdownHelpOpen, setMarkdownHelpOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const mouseHandler = (e: MouseEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', mouseHandler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', mouseHandler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [menuOpen])

  return (
    <header role="banner" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 56, background: 'var(--surface)',
      borderBottom: '1px solid var(--border)', gap: 16,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="2" width="18" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="8" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', letterSpacing: '-1.5px', textTransform: 'lowercase', fontFamily: 'var(--font-display)' }}>
            nots
          </span>
        </div>
        <span className="hide-mobile" style={{ fontSize: 9, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
          no necesitas otra app de notas
        </span>
      </div>

      <div style={{ flex: 1, maxWidth: 360, margin: '0 auto' }}>
        <SearchBar />
      </div>

      {isMobile ? (
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
            aria-expanded={menuOpen}
            style={{
              padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)',
              background: menuOpen ? 'var(--accent-light)' : 'transparent',
              color: menuOpen ? 'var(--accent)' : 'var(--text)',
              cursor: 'pointer', transition: 'all 0.15s',
              lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          {menuOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          padding: '12px', zIndex: 30, display: 'flex', flexDirection: 'column', gap: 4,
          minWidth: 180,
        }}>
          <button
            onClick={() => { setViewMode(viewMode === 'postit' ? 'list' : 'postit'); setMenuOpen(false) }}
            aria-label="Cambiar vista"
            style={{
              padding: '10px 16px', borderRadius: 6, border: 'none',
              background: viewMode === 'list' ? 'var(--accent-light)' : 'transparent',
              color: 'var(--text)', cursor: 'pointer', fontSize: 14, fontWeight: 500,
              textAlign: 'left', transition: 'all 0.1s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {viewMode === 'postit' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            )}
            {viewMode === 'postit' ? 'Lista' : 'Post-It'}
          </button>
          <button
            onClick={() => { setTheme(themeCycle(theme)); setMenuOpen(false) }}
            aria-label="Cambiar tema"
            style={{
              padding: '10px 16px', borderRadius: 6, border: 'none',
              background: 'transparent', color: 'var(--text)',
              cursor: 'pointer', fontSize: 14, fontWeight: 500,
              textAlign: 'left', transition: 'all 0.1s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : theme === 'system' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
            {theme === 'dark' ? 'Oscuro' : theme === 'system' ? 'Sistema' : 'Claro'}
          </button>
          <button
            onClick={() => { setMenuOpen(false); useUIStore.getState().setShowSettings(true) }}
            style={{
              padding: '10px 16px', borderRadius: 6, border: 'none',
              background: 'transparent', color: 'var(--text)',
              cursor: 'pointer', fontSize: 14, fontWeight: 500,
              textAlign: 'left', transition: 'all 0.1s',
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>Configuración</span>
          </button>
          {notes.filter(n => !n.deletedAt).length > 0 && (
            <button
              onClick={() => { setMenuOpen(false); onBorrarTodo?.() }}
              style={{
                padding: '10px 16px', borderRadius: 6, border: 'none',
                background: 'transparent', color: '#c0392b',
                cursor: 'pointer', fontSize: 14, fontWeight: 500,
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              Borrar Todo
            </button>
          )}
          <button
            onClick={() => { setMenuOpen(false); setMarkdownHelpOpen(true) }}
            style={{
              padding: '10px 16px', borderRadius: 6, border: 'none',
              background: 'transparent', color: 'var(--text)',
              cursor: 'pointer', fontSize: 14, fontWeight: 500,
              textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Ayuda Markdown</span>
          </button>
            </div>
          )}
        </div>
      ) : <>
        <nav style={{ display: 'flex', gap: 6, alignItems: 'center' }} aria-label="Controles principales">

          <button
            onClick={() => setViewMode(viewMode === 'postit' ? 'list' : 'postit')}
            aria-label={viewMode === 'postit' ? 'Cambiar a vista lista' : 'Cambiar a vista post-it'}
            style={{
              padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border)',
              background: viewMode === 'list' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'list' ? '#fff' : 'var(--text)',
              cursor: 'pointer', fontSize: 14, fontWeight: 500,
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {viewMode === 'postit' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            )}
            {viewMode === 'postit' ? 'Lista' : 'Post-It'}
          </button>
          <button
            onClick={() => setTheme(themeCycle(theme))}
            aria-label={`Tema: ${theme}`}
            style={{
              padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text)',
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : theme === 'system' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
          <button
            onClick={() => useUIStore.getState().setShowSettings(true)}
            aria-label="Configuración"
            style={{
              padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text)',
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, lineHeight: 1,
            }}
            title="Configuración"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button
            onClick={() => setMarkdownHelpOpen(true)}
            aria-label="Ayuda de Markdown"
            title="Ayuda Markdown"
            style={{
              padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text)',
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, lineHeight: 1,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>
          {notes.filter(n => !n.deletedAt).length > 0 && (
            <button
              onClick={onBorrarTodo}
              aria-label="Borrar todas las notas"
              title="Borrar Todo"
              style={{
                padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)',
                background: 'transparent', color: '#c0392b', cursor: 'pointer',
                fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              Borrar Todo
            </button>
          )}
        </nav>
      </>
      }
      {markdownHelpOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setMarkdownHelpOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', borderRadius: 8, overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)', width: '90%', maxWidth: 480,
            }}
          >
            <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                Ayuda de Markdown
              </h2>
              <button
                onClick={() => setMarkdownHelpOpen(false)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: 20, lineHeight: 1, padding: 4,
                }}
                aria-label="Cerrar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div style={{ padding: '16px 28px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['**negrita**', 'negrita'],
                ['*cursiva*', 'cursiva'],
                ['~~tachado~~', 'tachado'],
                ['# Título', 'Encabezado'],
                ['## Subtítulo', 'Sub-encabezado'],
                ['- Lista', 'Lista viñetas'],
                ['1. Lista', 'Lista numerada'],
                ['- [ ] Tarea', 'Tarea pendiente'],
                ['- [x] Tarea', 'Tarea hecha'],
                ['`código`', 'Código inline'],
                ['```código```', 'Bloque código'],
                ['> cita', 'Blockquote'],
                ['[texto](url)', 'Enlace'],
                ['![alt](url)', 'Imagen'],
                ['---', 'Línea horizontal'],
                ['| col1 | col2 |', 'Tabla'],
              ].map(([code, desc]) => (
                <div key={code} style={{
                  display: 'flex', flexDirection: 'column', gap: 2,
                  padding: '8px 10px', borderRadius: 4,
                  background: 'var(--bg)', fontSize: 13,
                }}>
                  <code style={{ fontSize: 12, color: 'var(--accent)' }}>{code}</code>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', opacity: 0.7 }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
