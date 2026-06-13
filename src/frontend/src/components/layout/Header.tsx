import { useState, useEffect, useCallback, useRef } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useNotesStore } from '../../stores/notesStore'
import { useUIStore } from '../../stores/uiStore'
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
  const toggleSidebar = useUIStore(s => s.toggleSidebar)
  const [importOpen, setImportOpen] = useState(false)
  const importRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!importOpen) return
    const handler = (e: MouseEvent) => {
      if (importRef.current && !importRef.current.contains(e.target as Node)) {
        setImportOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [importOpen])

  useEffect(() => {
    if (!menuOpen || !isMobile) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen, isMobile])

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
              padding: '6px 10px', borderRadius: 0, border: '1px solid var(--border)',
              background: menuOpen ? 'var(--accent-light)' : 'transparent',
              color: menuOpen ? 'var(--accent)' : 'var(--text)',
              cursor: 'pointer', fontSize: 15, transition: 'all 0.15s',
              lineHeight: 1,
            }}
          >
            ☰
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
                onClick={() => { toggleSidebar(); setMenuOpen(false) }}
                style={{
                  padding: '8px 14px', borderRadius: 0, border: 'none',
                  background: 'transparent', color: 'var(--text)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  textAlign: 'left', transition: 'all 0.1s',
                }}
              >
                ◀ / ▶ Sidebar
              </button>
              <button
                onClick={() => { setImportOpen(!importOpen); setMenuOpen(false) }}
                aria-label="Exportar o importar notas"
                style={{
                  padding: '8px 14px', borderRadius: 0, border: 'none',
                  background: 'transparent', color: 'var(--text)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  textAlign: 'left', transition: 'all 0.1s',
                }}
              >
                ⤓ / ⤒ Exportar / Importar
              </button>
              <button
                onClick={() => { setViewMode(viewMode === 'postit' ? 'list' : 'postit'); setMenuOpen(false) }}
                aria-label="Cambiar vista"
                style={{
                  padding: '8px 14px', borderRadius: 0, border: 'none',
                  background: viewMode === 'list' ? 'var(--accent-light)' : 'transparent',
                  color: 'var(--text)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  textAlign: 'left', transition: 'all 0.1s',
                }}
              >
                {viewMode === 'postit' ? '☰ Vista Lista' : '⊞ Vista Post-It'}
              </button>
              <button
                onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setMenuOpen(false) }}
                aria-label="Cambiar tema"
                style={{
                  padding: '8px 14px', borderRadius: 0, border: 'none',
                  background: 'transparent', color: 'var(--text)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  textAlign: 'left', transition: 'all 0.1s',
                }}
              >
                {theme === 'dark' ? '☀️ Tema Claro' : '🌙 Tema Oscuro'}
              </button>
              <button
                onClick={() => { setMenuOpen(false) }}
                style={{
                  padding: '8px 14px', borderRadius: 0, border: 'none',
                  background: 'transparent', color: 'var(--text)',
                  cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  textAlign: 'left', transition: 'all 0.1s',
                }}
              >
                📦 Exportar ZIP
              </button>
              <label
                style={{
                  padding: '8px 14px', cursor: 'pointer', display: 'block',
                  fontSize: 13, color: 'var(--text)', fontWeight: 500,
                }}
              >
                📂 Importar .md
                <input
                  type="file"
                  accept=".md"
                  multiple
                  onChange={e => { importFiles(e.target.files); setMenuOpen(false) }}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}
        </div>
      ) : (
        <nav style={{ display: 'flex', gap: 6, alignItems: 'center' }} aria-label="Controles principales">
          <div ref={importRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setImportOpen(!importOpen)}
              aria-label="Exportar o importar notas"
              aria-expanded={importOpen}
              style={{
                padding: '6px 14px', borderRadius: 0, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text)',
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
                transition: 'all 0.15s',
              }}
            >
              ⤓ / ⤒
            </button>
            {importOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                minWidth: 180, zIndex: 20, overflow: 'hidden',
              }}>
                <button
                  onClick={exportAll}
                  style={{
                    display: 'block', width: '100%', padding: '10px 14px',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    textAlign: 'left', fontSize: 13, color: 'var(--text)',
                    transition: 'background 0.1s',
                  }}
                >
                  📦 Exportar ZIP
                </button>
                <label
                  style={{
                    display: 'block', padding: '10px 14px', cursor: 'pointer',
                    fontSize: 13, color: 'var(--text)', transition: 'background 0.1s',
                  }}
                >
                  📂 Importar .md
                  <input
                    type="file"
                    accept=".md"
                    multiple
                    onChange={e => importFiles(e.target.files)}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </div>

          <button
            onClick={() => setViewMode(viewMode === 'postit' ? 'list' : 'postit')}
            aria-label={viewMode === 'postit' ? 'Cambiar a vista lista' : 'Cambiar a vista post-it'}
            style={{
              padding: '6px 14px', borderRadius: 0, border: '1px solid var(--border)',
              background: viewMode === 'list' ? 'var(--accent)' : 'transparent',
              color: viewMode === 'list' ? '#fff' : 'var(--text)',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              transition: 'all 0.15s',
            }}
          >
            {viewMode === 'postit' ? '☰ Lista' : '⊞ Post-It'}
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            style={{
              padding: '6px 14px', borderRadius: 0, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text)',
              cursor: 'pointer', fontSize: 15, transition: 'all 0.15s',
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <StorageIndicator />
        </nav>
      )}
    </header>
  )
}
