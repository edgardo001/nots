import { useState, useEffect, useCallback, useRef } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { getSetting, setSetting } from '../../db/operations'
import { useNotesStore } from '../../stores/notesStore'
import { noteToMarkdown } from '../layout/Header'

const sections = ['Perfil', 'Idioma', 'Almacenamiento', 'Exportar / Importar'] as const
type Section = typeof sections[number]

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let val = bytes
  while (val >= 1024 && i < units.length - 1) { val /= 1024; i++ }
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function StorageSection() {
  const [usage, setUsage] = useState<{ used: number; total: number } | null>(null)

  useEffect(() => {
    navigator.storage?.estimate().then(est => {
      if (est.usage != null && est.quota != null) setUsage({ used: est.usage, total: est.quota })
    })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Este círculo muestra el espacio que ocupan tus notas en el navegador.
        Toda la información se almacena localmente: no se envía nada a ningún servidor.
      </p>

      {usage && (() => {
        const { used, total } = usage
        const pct = Math.min((used / total) * 100, 100)
        const usedFmt = formatBytes(used)
        const totalFmt = formatBytes(total)

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
    </div>
  )
}

function ExportImportSection() {
  const notes = useNotesStore(s => s.notes)
  const addNote = useNotesStore(s => s.addNote)
  const updateNote = useNotesStore(s => s.updateNote)
  const fileRef = useRef<HTMLInputElement>(null)

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

      await addNote()
      const newNotes = useNotesStore.getState().notes
      const lastNote = newNotes[newNotes.length - 1]
      if (lastNote) {
        await updateNote(lastNote.id, { title, content, tags, emoji })
      }
    }
  }, [addNote, updateNote])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Exporta todas tus notas como archivos Markdown en un ZIP, o importa archivos .md.
      </p>
      <button
        onClick={exportAll}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '12px 16px',
          borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)',
          cursor: 'pointer', textAlign: 'left', fontSize: 13, color: 'var(--text)',
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
        onClick={() => fileRef.current?.click()}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '12px 16px',
          borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)',
          cursor: 'pointer', textAlign: 'left', fontSize: 13, color: 'var(--text)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        Importar .md
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".md"
        multiple
        onChange={e => importFiles(e.target.files)}
        style={{ display: 'none' }}
      />
    </div>
  )
}

function ProfileSection() {
  const [author, setAuthor] = useState('')
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getSetting('app:author').then(s => {
      if (s?.value) setAuthor(s.value as string)
      setLoaded(true)
    })
  }, [])

  const handleSave = async () => {
    await setSetting('app:author', author)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Autor</label>
      <input
        type="text"
        value={author}
        onChange={e => setAuthor(e.target.value)}
        placeholder="Tu nombre"
        aria-label="Nombre del autor"
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 6,
          border: '1px solid var(--border)', background: 'var(--bg)',
          color: 'var(--text)', fontSize: 14, outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={handleSave}
          disabled={!loaded}
          style={{
            padding: '10px 24px', borderRadius: 6, border: 'none',
            background: loaded ? 'var(--accent)' : 'var(--border)',
            color: '#fff', cursor: loaded ? 'pointer' : 'default',
            fontSize: 14, fontWeight: 600,
          }}
        >
          Guardar
        </button>
        {saved && (
          <span style={{ fontSize: 13, color: '#27ae60', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Guardado
          </span>
        )}
      </div>
    </div>
  )
}

function IdiomaSection() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 120, fontSize: 14, color: 'var(--text-secondary)', opacity: 0.6,
    }}>
      Próximamente
    </div>
  )
}

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<Section>('Perfil')

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Configuración"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        zIndex: 1000, display: 'flex', alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 600, width: '100%', maxHeight: '80vh',
          background: 'var(--surface)', borderRadius: 8,
          display: 'flex', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{
          width: 200, borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
          <div style={{
            padding: '20px 16px 12px', fontSize: 14, fontWeight: 700,
            color: 'var(--text)', letterSpacing: '-0.3px',
          }}>
            Configuración
          </div>
          {sections.map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              style={{
                padding: '10px 16px', border: 'none', background: 'transparent',
                color: activeSection === s ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: activeSection === s ? 600 : 400,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.1s',
                borderRight: activeSection === s ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{
          flex: 1, padding: '20px 24px', overflowY: 'auto',
          position: 'relative', minHeight: 200,
          display: 'flex', flexDirection: 'column',
        }}>
          <button
            onClick={onClose}
            aria-label="Cerrar configuración"
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', padding: 4, lineHeight: 1,
              display: 'flex',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 20, marginTop: 4 }}>
            {activeSection}
          </div>

          {activeSection === 'Perfil' && <ProfileSection />}
          {activeSection === 'Idioma' && <IdiomaSection />}
          {activeSection === 'Almacenamiento' && <StorageSection />}
          {activeSection === 'Exportar / Importar' && <ExportImportSection />}
          <div style={{ marginTop: 'auto', paddingTop: 20, textAlign: 'center' }}>
            <a
              href="https://github.com/edgardo001/nots"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11, color: 'var(--text-secondary)', opacity: 0.5,
                textDecoration: 'none', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.5' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              github.com/edgardo001/nots
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
