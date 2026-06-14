import { useState, useEffect, useCallback, useRef, createRef } from 'react'
import { createPortal } from 'react-dom'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useNotesStore } from '../../stores/notesStore'
import { useUIStore, themeCycle } from '../../stores/uiStore'
import SearchBar from '../sidebar/SearchBar'
import StorageIndicator from '../settings/StorageIndicator'

function noteToMarkdown(note: { title: string; content: string; tags: string[]; emoji: string; color: string; createdAt: string; updatedAt: string }): string {
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

function StorageModal({ onClose }: { onClose: () => void }) {
  const [usage, setUsage] = useState<{ used: number; total: number } | null>(null)

  useEffect(() => {
    navigator.storage?.estimate().then(est => {
      if (est.usage != null && est.quota != null) setUsage({ used: est.usage, total: est.quota })
    })
  }, [])

  const format = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB']
    let i = 0
    let val = bytes
    while (val >= 1024 && i < units.length - 1) { val /= 1024; i++ }
    return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
  }

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', borderRadius: 12, padding: 28, maxWidth: 360, width: '90%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
            Almacenamiento
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
              fontSize: 20, lineHeight: 1, padding: 4,
            }}
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Este círculo muestra el espacio que ocupan tus notas en el navegador.
          Toda la información se almacena localmente: no se envía nada a ningún servidor.
        </p>

        {usage && (() => {
          const { used, total } = usage
          const pct = Math.min((used / total) * 100, 100)
          const usedFmt = format(used)
          const totalFmt = format(total)

          const size = 80
          const stroke = 6
          const radius = (size - stroke) / 2
          const circumference = 2 * Math.PI * radius
          const dashoffset = circumference - (pct / 100) * circumference

          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
                  <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={pct > 80 ? '#e85d3a' : 'var(--accent)'} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                </svg>
                <span style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: 'var(--text)',
                }}>
                  {usedFmt.replace(/ .*/, '')}
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {usedFmt} de {totalFmt} · {pct.toFixed(1)}%
              </span>
            </div>
          )
        })()}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Notas</span>
            <strong>{useNotesStore.getState().notes.filter(n => !n.deletedAt).length}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>En papelera</span>
            <strong>{useNotesStore.getState().notes.filter(n => !!n.deletedAt).length}</strong>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Los datos se almacenan en <strong>IndexedDB</strong> dentro de tu navegador.
            Puedes liberar espacio exportando notas y vaciando la papelera.
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '10px', borderRadius: 8, border: 'none',
            background: 'var(--accent)', color: '#fff', cursor: 'pointer',
            fontSize: 14, fontWeight: 600,
          }}
        >
          Cerrar
        </button>
      </div>
    </div>,
    document.body
  )
}

interface HeaderProps {
  isMobile?: boolean
}

export default function Header({ isMobile }: HeaderProps) {
  const viewMode = useNotesStore(s => s.viewMode)
  const setViewMode = useNotesStore(s => s.setViewMode)
  const notes = useNotesStore(s => s.notes)
  const addNote = useNotesStore(s => s.addNote)
  const theme = useUIStore(s => s.theme)
  const setTheme = useUIStore(s => s.setTheme)
  const [importOpen, setImportOpen] = useState(false)
  const importRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const mobileFileRef = useRef<HTMLInputElement>(null)
  const desktopFileRef = useRef<HTMLInputElement>(null)
  const [storageModalOpen, setStorageModalOpen] = useState(false)

  useEffect(() => {
    if (!importOpen && !menuOpen) return
    const mouseHandler = (e: MouseEvent) => {
      if (importOpen && importRef.current && !importRef.current.contains(e.target as Node)) setImportOpen(false)
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') { setImportOpen(false); setMenuOpen(false) } }
    document.addEventListener('mousedown', mouseHandler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', mouseHandler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [importOpen, menuOpen])

  const exportAll = useCallback(async () => {
    const zip = new JSZip()
    const activeNotes = notes.filter(n => !n.deletedAt)
    for (const note of activeNotes) {
      const filename = `${note.title || 'sin-titulo'}.md`.replace(/[^a-zA-Z0-9áéíóúñü.-]/g, '_')
      zip.file(filename, noteToMarkdown(note))
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, `notas-export-${new Date().toISOString().slice(0, 10)}.zip`)
  }, [notes])

  const importFiles = useCallback(async (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files)) {
      if (!file.name.endsWith('.md')) continue
      const text = await file.text()
      let title = file.name.replace(/\.md$/, '')
      let content = text
      let tags: string[] = []
      let emoji = '📝'

      const frontmatterMatch = text.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/)
      if (frontmatterMatch) {
        const [, yaml, body] = frontmatterMatch
        content = body
        const titleMatch = yaml.match(/title:\s*"?(.+?)"?\s*$/m)
        if (titleMatch) title = titleMatch[1]
        const tagsMatch = yaml.match(/tags:\s*\[(.+?)\]/)
        if (tagsMatch) tags = tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean)
        const emojiMatch = yaml.match(/emoji:\s*(.+?)\s*$/m)
        if (emojiMatch) emoji = emojiMatch[1]
      }

      const store = useNotesStore.getState()
      await store.addNote()
      const newNotes = useNotesStore.getState().notes
      const lastNote = newNotes[newNotes.length - 1]
      if (lastNote) {
        await store.updateNote(lastNote.id, { title, content, tags, emoji })
      }
    }
    setImportOpen(false)
  }, [])

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
            onClick={() => { setImportOpen(!importOpen); setMenuOpen(false) }}
            aria-label="Exportar o importar notas"
            style={{
              padding: '10px 16px', borderRadius: 6, border: 'none',
              background: 'transparent', color: 'var(--text)',
              cursor: 'pointer', fontSize: 14, fontWeight: 500,
              textAlign: 'left', transition: 'all 0.1s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar / Importar
          </button>
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
            onClick={() => { setMenuOpen(false); setStorageModalOpen(true) }}
            style={{
              padding: '10px 16px', borderRadius: 6, border: 'none',
              background: 'transparent', color: 'var(--text)',
              cursor: 'pointer', fontSize: 14, fontWeight: 500,
              textAlign: 'left', transition: 'all 0.1s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            Exportar ZIP
          </button>
          <button
            onClick={() => { setMenuOpen(false); setStorageModalOpen(true) }}
            style={{
              padding: '10px 16px', borderRadius: 6, border: 'none',
              background: 'transparent', color: 'var(--text)',
              cursor: 'pointer', fontSize: 14, fontWeight: 500,
              textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><circle cx="12" cy="8.5" r=".5" fill="currentColor"/>
            </svg>
            Almacenamiento
          </button>
          <button
            onClick={() => mobileFileRef.current?.click()}
            style={{
              padding: '10px 16px', borderRadius: 6, border: 'none',
              background: 'transparent', color: 'var(--text)',
              cursor: 'pointer', fontSize: 14, fontWeight: 500,
              textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Importar .md
          </button>
              <input
                ref={mobileFileRef}
                type="file"
                accept=".md"
                multiple
                onChange={e => { importFiles(e.target.files); setMenuOpen(false) }}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
      ) : <>
        <nav style={{ display: 'flex', gap: 6, alignItems: 'center' }} aria-label="Controles principales">
          <div ref={importRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setImportOpen(!importOpen)}
              aria-label="Exportar o importar notas"
              aria-expanded={importOpen}
              style={{
                padding: '8px 14px', borderRadius: 6, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text)',
                cursor: 'pointer', fontSize: 14, fontWeight: 500,
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </button>
            {importOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                minWidth: 180, zIndex: 20, overflow: 'hidden',
              }}>
                <button
                  onClick={exportAll}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    textAlign: 'left', fontSize: 13, color: 'var(--text)',
                    transition: 'background 0.1s',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                  Exportar ZIP
                </button>
                <button
                  onClick={() => desktopFileRef.current?.click()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    textAlign: 'left', fontSize: 13, color: 'var(--text)',
                    transition: 'background 0.1s',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  Importar .md
                </button>
                <input
                  ref={desktopFileRef}
                  type="file"
                  accept=".md"
                  multiple
                  onChange={e => importFiles(e.target.files)}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>

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
          <StorageIndicator onClick={() => setStorageModalOpen(true)} />
        </nav>
      </>
      }
      {storageModalOpen && <StorageModal onClose={() => setStorageModalOpen(false)} />}
    </header>
  )
}
