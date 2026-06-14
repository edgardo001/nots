import { useState, useEffect, useCallback, useRef } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Note, NoteVersion } from '../../types'
import { useNotesStore } from '../../stores/notesStore'

const EMOJIS = [
  '📝', '✅', '📌', '⭐', '💡', '🔔', '📎', '📋', '📅',
  '🎯', '🔥', '💪', '🚀', '🎨', '📚', '💻', '🎵', '🎬',
  '❤️', '💛', '💚', '💙', '💜', '🧡', '🖤', '🤍', '🤎',
  '😊', '😂', '🤔', '😎', '🥳', '😢', '😤', '🙏', '✨',
  '🌱', '🌸', '🌞', '🌈', '⭐', '🌙', '☀️', '💫', '⚡',
  '🏠', '🚗', '✈️', '🏖️', '📍', '🗺️', '🎒', '🏆', '🎁',
  '💰', '🛒', '🔑', '📱', '🖥️', '📷', '🎧', '⌚', '🕹️',
  '🍕', '🍔', '☕', '🍺', '🍰', '🥗', '🍜', '🧁', '🍩',
]

const NOTE_COLORS = [
  '#fff5f5', '#fff8e8', '#f0faf0', '#e8f4fd',
  '#f5f0ff', '#fef0f5', '#f0faf8', '#fff5e8',
  '#f5f5f5', '#fffff0', '#f0f8ff', '#fdf5f0',
]

interface NoteEditorProps {
  noteId: string
  isMobile?: boolean
  saveRef?: React.MutableRefObject<(() => Promise<void>) | null>
}

export default function NoteEditor({ noteId, isMobile, saveRef }: NoteEditorProps) {
  const notes = useNotesStore(s => s.notes)
  const trashNotes = useNotesStore(s => s.trashNotes)
  const updateNote = useNotesStore(s => s.updateNote)
  const deleteNote = useNotesStore(s => s.deleteNote)
  const permanentlyDeleteNote = useNotesStore(s => s.permanentlyDeleteNote)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const saveVersion = useNotesStore(s => s.saveVersion)
  const getVersions = useNotesStore(s => s.getVersions)
  const restoreVersion = useNotesStore(s => s.restoreVersion)
  const forkFromVersion = useNotesStore(s => s.forkFromVersion)
  const deleteVersion = useNotesStore(s => s.deleteVersion)
  const note = notes.find(n => n.id === noteId) || trashNotes.find(n => n.id === noteId)

  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [emoji, setEmoji] = useState(note?.emoji ?? '📝')
  const [tagInput, setTagInput] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)
  const [preview, setPreview] = useState(note ? note.content.length > 0 : true)
  const [versions, setVersions] = useState<NoteVersion[]>([])
  const [versionsOpen, setVersionsOpen] = useState(false)
  const [versionsLoaded, setVersionsLoaded] = useState(false)
  const [viewingVersionId, setViewingVersionId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [markdownHelpOpen, setMarkdownHelpOpen] = useState(false)
  const emojiRef = useRef<HTMLDivElement>(null)
  const colorRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const savedVersionRef = useRef<string>('')


  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setEmoji(note.emoji)
      savedVersionRef.current = note.content
    }
  }, [note])

  useEffect(() => {
    const close = () => { setEmojiOpen(false); setColorOpen(false); setVersionsOpen(false) }
    if (!emojiOpen && !colorOpen && !versionsOpen) return
    const mouseHandler = (e: MouseEvent) => {
      if (emojiOpen && emojiRef.current && !emojiRef.current.contains(e.target as Node)) setEmojiOpen(false)
      if (colorOpen && colorRef.current && !colorRef.current.contains(e.target as Node)) setColorOpen(false)
    }
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', mouseHandler)
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('mousedown', mouseHandler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [emojiOpen, colorOpen, versionsOpen])

  const loadVersions = useCallback(async () => {
    if (!noteId || versionsLoaded) return
    const v = await getVersions(noteId)
    setVersions(v)
    setVersionsLoaded(true)
  }, [noteId, getVersions, versionsLoaded])

  useEffect(() => {
    setVersionsLoaded(false)
    setVersions([])
  }, [noteId])

  const save = useCallback(async () => {
    if (!note) return
    const tags = note.tags
    const changed = title !== note.title || content !== note.content || emoji !== note.emoji || (note.color || NOTE_COLORS[0]) !== note.color
    if (changed) {
      updateNote(note.id, { title, content, emoji, tags })
    }
    if (content !== savedVersionRef.current && content.length > 0) {
      await saveVersion(note.id, title || 'Sin título', content)
      savedVersionRef.current = content
    }
  }, [note, title, content, emoji, updateNote, saveVersion])

  // Save on unmount (close/back)
  const saveOnUnmount = useRef(save)
  saveOnUnmount.current = save
  useEffect(() => {
    return () => { saveOnUnmount.current() }
  }, [])

  useEffect(() => {
    if (saveRef) {
      saveRef.current = save
    }
    return () => {
      if (saveRef) {
        saveRef.current = null
      }
    }
  }, [save, saveRef])

  const handleRestoreVersion = async (version: NoteVersion) => {
    if (content.length > 0) {
      await saveVersion(noteId, title || 'Sin título', content)
    }
    await restoreVersion(noteId, version)
    setTitle(version.title)
    setContent(version.content)
    savedVersionRef.current = version.content
    setVersionsLoaded(false)
    const v = await getVersions(noteId)
    setVersions(v)
  }

  const handleForkVersion = async (version: NoteVersion) => {
    await forkFromVersion(version)
  }

  const handleImageInsert = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const markdown = `![${file.name}](${dataUrl})`
      setContent(prev => prev + '\n\n' + markdown)
    }
    reader.readAsDataURL(file)
  }, [])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) handleImageInsert(file)
        return
      }
    }
  }, [handleImageInsert])

  const insertAtCursor = useCallback((text: string) => {
    const ta = contentRef.current
    if (ta) {
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newContent = content.slice(0, start) + text + content.slice(end)
      setContent(newContent)
      requestAnimationFrame(() => {
        ta.focus()
        ta.selectionStart = ta.selectionEnd = start + text.length
      })
    } else {
      setContent(prev => prev + '\n' + text)
    }
  }, [content])

  if (!note) return null

  const allTags = [...new Set(notes.filter(n => !n.deletedAt).flatMap(n => n.tags))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', flex: isMobile ? 1 : undefined, minHeight: isMobile ? 0 : undefined }}>
      {isMobile ? (
        <>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button
              onClick={() => setActiveNote(null)}
              aria-label="Cerrar sin guardar"
              title="Cerrar"
              style={{
                width: 36, height: 36, borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.10)',
                background: 'rgba(0,0,0,0.04)', cursor: 'pointer',
                lineHeight: 1, flexShrink: 0, color: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div ref={emojiRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setEmojiOpen(!emojiOpen)}
                aria-label="Seleccionar emoji"
                aria-expanded={emojiOpen}
                style={{
                  width: 36, height: 36, borderRadius: 6,
                  border: '1px solid rgba(0,0,0,0.10)',
                  background: 'rgba(0,0,0,0.04)', cursor: 'pointer',
                  fontSize: 20, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'all 0.15s',
                  lineHeight: 1,
                }}
              >
                {emoji}
              </button>
              {emojiOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: 6,
                  zIndex: 20, background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  padding: 10, width: isMobile ? 216 : 270, display: 'grid',
                  gridTemplateColumns: `repeat(${isMobile ? 8 : 9}, 1fr)`, gap: 2,
                  animation: 'fadeIn 0.1s ease',
                }}>
                  {EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => { setEmoji(e); setEmojiOpen(false); updateNote(note.id, { emoji: e }); }}
                      style={{
                        width: 26, height: 26, borderRadius: 0, border: 'none',
                        background: e === emoji ? 'var(--accent-light)' : 'transparent',
                        cursor: 'pointer', fontSize: 16, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.1s',
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={e => { if (e.target.files?.[0]) handleImageInsert(e.target.files[0]); e.target.value = '' }}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              aria-label="Insertar imagen"
              style={{
                width: 36, height: 36, borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.10)',
                background: 'rgba(0,0,0,0.04)', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all 0.15s',
                flexShrink: 0, lineHeight: 1,
              }}
              title="Insertar imagen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </button>
            <button
              onClick={() => setPreview(!preview)}
              aria-label={preview ? 'Cambiar a edición' : 'Cambiar a vista previa'}
              style={{
                width: 36, height: 36, borderRadius: 6,
                border: `1px solid ${preview ? 'rgba(0,0,0,0.20)' : 'rgba(0,0,0,0.10)'}`,
                background: preview ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)',
                cursor: 'pointer', lineHeight: 1, flexShrink: 0,
                color: preview ? 'var(--text)' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              title={preview ? 'Editar' : 'Vista previa'}
            >
              {preview ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
            <button
              onClick={() => setMarkdownHelpOpen(true)}
              aria-label="Ayuda de Markdown"
              title="Ayuda Markdown"
              style={{
                width: 36, height: 36, borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.10)',
                background: 'rgba(0,0,0,0.04)', cursor: 'pointer',
                lineHeight: 1, flexShrink: 0, color: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              aria-label="Eliminar nota"
              style={{
                width: 36, height: 36, borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.10)',
                background: 'rgba(0,0,0,0.04)', cursor: 'pointer',
                lineHeight: 1, flexShrink: 0,
                color: '#c0392b', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              title="Eliminar nota"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          <button
            onClick={async () => { await save(); setActiveNote(null) }}
              aria-label="Guardar y cerrar"
              title="Guardar y cerrar"
              style={{
                width: 36, height: 36, borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.10)',
                background: '#27ae60', cursor: 'pointer',
                lineHeight: 1, flexShrink: 0,
                color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
            </button>
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={save}
            placeholder="Título"
            aria-label="Título de la nota"
            style={{
              width: '100%', padding: '8px 10px', borderRadius: 6,
              border: '1px solid rgba(0,0,0,0.10)',
              background: 'transparent',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
              color: 'inherit', fontSize: 18, fontWeight: 700,
              outline: 'none',
            }}
          />
        </>
      ) : (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <div ref={emojiRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setEmojiOpen(!emojiOpen)}
              aria-label="Seleccionar emoji"
              aria-expanded={emojiOpen}
              style={{
                width: 36, height: 36, borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.10)',
                background: 'rgba(0,0,0,0.04)', cursor: 'pointer',
                fontSize: 20, display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all 0.15s',
                lineHeight: 1,
              }}
            >
              {emoji}
            </button>
            {emojiOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 6,
                zIndex: 20, background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                padding: 10, width: 270, display: 'grid',
                gridTemplateColumns: `repeat(9, 1fr)`, gap: 2,
                animation: 'fadeIn 0.1s ease',
              }}>
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => { setEmoji(e); setEmojiOpen(false); updateNote(note.id, { emoji: e }); }}
                    style={{
                      width: 26, height: 26, borderRadius: 0, border: 'none',
                      background: e === emoji ? 'var(--accent-light)' : 'transparent',
                      cursor: 'pointer', fontSize: 16, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.1s',
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={e => { if (e.target.files?.[0]) handleImageInsert(e.target.files[0]); e.target.value = '' }}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            aria-label="Insertar imagen"
            style={{
              width: 36, height: 36, borderRadius: 6,
              border: '1px solid rgba(0,0,0,0.10)',
              background: 'rgba(0,0,0,0.04)', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', transition: 'all 0.15s',
              flexShrink: 0, lineHeight: 1,
            }}
            title="Insertar imagen"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={save}
            placeholder="Título"
            aria-label="Título de la nota"
            style={{
              flex: 1, padding: '8px 10px', borderRadius: 6,
              border: '1px solid rgba(0,0,0,0.10)',
              background: 'transparent',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
              color: 'inherit', fontSize: 18, fontWeight: 700,
              outline: 'none',
            }}
          />
          <button
            onClick={() => setPreview(!preview)}
            aria-label={preview ? 'Cambiar a edición' : 'Cambiar a vista previa'}
            style={{
              width: 36, height: 36, borderRadius: 6,
              border: `1px solid ${preview ? 'rgba(0,0,0,0.20)' : 'rgba(0,0,0,0.10)'}`,
              background: preview ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)',
              cursor: 'pointer', lineHeight: 1, flexShrink: 0,
              color: preview ? 'var(--text)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            title={preview ? 'Editar' : 'Vista previa'}
          >
            {preview ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              aria-label="Eliminar nota"
              style={{
                width: 36, height: 36, borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.10)',
                background: 'rgba(0,0,0,0.04)', cursor: 'pointer',
                lineHeight: 1, flexShrink: 0,
                color: '#c0392b', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              title="Eliminar nota"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          <button
            onClick={async () => { await save(); setActiveNote(null) }}
            aria-label="Guardar y cerrar"
            title="Guardar y cerrar"
            style={{
              width: 36, height: 36, borderRadius: 6,
              border: '1px solid rgba(0,0,0,0.10)',
              background: '#27ae60', cursor: 'pointer',
              lineHeight: 1, flexShrink: 0,
              color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
          </button>
        </div>
      )}

      {preview ? (
        <div
          role="region"
          aria-label="Vista previa de Markdown"
          style={{
            minHeight: isMobile ? 0 : 200, padding: 0,
            border: 'none',
            background: 'transparent',
            color: 'inherit', fontSize: 16, lineHeight: 1.7,
            overflowY: 'auto',
            flex: isMobile ? 1 : undefined,
          }}>
          <Markdown remarkPlugins={[remarkGfm]}>
            {content || '*Sin contenido*'}
          </Markdown>
        </div>
      ) : (
        <textarea
          ref={contentRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          onBlur={save}
          onPaste={handlePaste}
          placeholder="Escribe tu nota aquí... (soporta **Markdown**, Ctrl+V para pegar imágenes)"
          aria-label="Contenido de la nota"
          style={{
            minHeight: isMobile ? 0 : 200, padding: 0,
            border: 'none',
            background: 'transparent',
            color: 'inherit', fontSize: 16, lineHeight: 1.7,
            resize: 'vertical', outline: 'none', fontFamily: 'inherit',
            width: '100%', boxSizing: 'border-box',
            flex: isMobile ? 1 : undefined,
          }}
        />
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {note.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 12, padding: '3px 10px', borderRadius: 0,
            background: 'var(--accent-light)', color: 'var(--accent)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            #{tag}
            <button
              onClick={() => updateNote(note.id, { tags: note.tags.filter(t => t !== tag) })}
              aria-label={`Eliminar etiqueta ${tag}`}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--accent)', opacity: 0.5, padding: 0, fontSize: 12,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </span>
        ))}
        <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if ((e.key === 'Enter' || e.key === 'Done' || e.key === 'Go') && tagInput.trim()) {
                e.preventDefault()
                const newTags = [...note.tags, tagInput.trim().toLowerCase()]
                updateNote(note.id, { tags: newTags })
                setTagInput('')
              }
            }}
            enterKeyHint="done"
            inputMode="search"
            placeholder="+ etiqueta"
            aria-label="Agregar etiqueta"
            style={{
              padding: '3px 10px', borderRadius: 0, border: '1px dashed var(--border)',
              background: 'transparent', color: 'var(--text-secondary)',
            fontSize: 13, width: 100, outline: 'none',
          }}
        />
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{
            position: 'absolute', left: 8, opacity: 0.4, pointerEvents: 'none',
          }}>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <input
            type="text"
            value={note.folder === 'default' ? '' : note.folder}
            onChange={e => updateNote(note.id, { folder: e.target.value || 'default' })}
            placeholder="carpeta"
            aria-label="Carpeta de la nota"
            style={{
              padding: '5px 10px 5px 28px', borderRadius: 6, border: '1px dashed var(--border)',
              background: 'transparent', color: 'var(--text-secondary)',
              fontSize: 13, width: 100, outline: 'none',
              }}
            />
          </div>
          {tagInput.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              minWidth: 140, zIndex: 10, overflow: 'hidden',
            }}>
              {allTags
                .filter(t => t.includes(tagInput.toLowerCase()) && !note.tags.includes(t))
                .slice(0, 5)
                .map(t => (
                  <div
                    key={t}
                    onClick={() => {
                      updateNote(note.id, { tags: [...note.tags, t] })
                      setTagInput('')
                    }}
                    style={{
                      padding: '6px 12px', cursor: 'pointer', fontSize: 12,
                      color: 'inherit', transition: 'background 0.1s',
                    }}
                  >
                    #{t}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <button
          onClick={() => { setVersionsOpen(!versionsOpen); if (!versionsOpen) loadVersions() }}
          aria-expanded={versionsOpen}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 12, padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Historial de versiones
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 'auto', transition: 'transform 0.2s', transform: versionsOpen ? 'rotate(90deg)' : 'none' }}>
            <path d="M3 1L7 5L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {versionsOpen && (
          <div style={{
            marginTop: 8, border: '1px solid var(--border)', borderRadius: 0,
            overflow: 'hidden', maxHeight: 200, overflowY: 'auto',
          }}>
            {versions.length === 0 ? (
              <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)', opacity: 0.6 }}>
                Sin versiones guardadas
              </div>
            ) : (
              versions.map(v => (
                <div key={v.id}>
                  <div
                    onClick={() => setViewingVersionId(viewingVersionId === v.id ? null : v.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 14px', borderBottom: '1px solid var(--border)',
                      fontSize: 12, cursor: 'pointer', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>
                        v{v.versionNumber} — {v.title || 'Sin título'}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>
                        {new Date(v.savedAt).toLocaleString()}
                        {v.lat != null && v.lng != null && (
                          <span> · 📍{v.lat.toFixed(4)}, {v.lng.toFixed(4)}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                      <button
                        onClick={e => { e.stopPropagation(); handleForkVersion(v) }}
                        style={{
                          padding: '4px 8px', borderRadius: 0,
                          border: '1px solid var(--border)', background: 'transparent',
                          color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 11,
                          fontWeight: 600, transition: 'all 0.15s',
                        }}
                        title="Crear nota nueva desde esta versión"
                      >
                        Fork
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleRestoreVersion(v) }}
                        style={{
                          padding: '4px 10px', borderRadius: 0,
                          border: '1px solid var(--accent)', background: 'transparent',
                          color: 'var(--accent)', cursor: 'pointer', fontSize: 11,
                          fontWeight: 600, transition: 'all 0.15s',
                        }}
                      >
                        Restaurar
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          if (window.confirm('¿Eliminar esta versión?')) {
                            deleteVersion(v.id)
                            setVersions(versions.filter(x => x.id !== v.id))
                            if (viewingVersionId === v.id) setViewingVersionId(null)
                          }
                        }}
                        style={{
                          padding: '4px 6px', borderRadius: 0,
                          border: '1px solid var(--border)', background: 'transparent',
                          color: '#c0392b', cursor: 'pointer', fontSize: 11,
                          fontWeight: 600, transition: 'all 0.15s', lineHeight: 1,
                        }}
                        title="Eliminar versión"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  {viewingVersionId === v.id && (
                    <div style={{
                      padding: '12px 14px', borderBottom: '1px solid var(--border)',
                      background: 'var(--bg)', fontSize: 13,
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                        {v.title || 'Sin título'}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 10 }}>
                        {new Date(v.savedAt).toLocaleString()}
                        {v.lat != null && v.lng != null && (
                          <span> · 📍{v.lat.toFixed(4)}, {v.lng.toFixed(4)}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 10 }}>
                        <Markdown remarkPlugins={[remarkGfm]}>{v.content || '*Sin contenido*'}</Markdown>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={e => { e.stopPropagation(); handleForkVersion(v) }}
                          style={{
                            padding: '4px 10px', borderRadius: 0,
                            border: '1px solid var(--border)', background: 'transparent',
                            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          Fork
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleRestoreVersion(v) }}
                          style={{
                            padding: '4px 10px', borderRadius: 0,
                            border: '1px solid var(--accent)', background: 'transparent',
                            color: 'var(--accent)', cursor: 'pointer', fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          Restaurar
                        </button>
                        <button
                          onClick={() => setViewingVersionId(null)}
                          style={{
                            padding: '4px 10px', borderRadius: 0,
                            border: '1px solid var(--border)', background: 'transparent',
                            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          Cerrar vista
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', opacity: 0.5 }}>
          {note.author && <span style={{ marginRight: 8 }}>Por {note.author} · </span>}
          Creado {new Date(note.createdAt).toLocaleString()} · Última edición {new Date(note.updatedAt).toLocaleString()}
          {note.createdLat != null && note.createdLng != null && (
            <span title={`Creado en: ${note.createdLat.toFixed(4)}, ${note.createdLng.toFixed(4)}`}>
              {' · '}📍 {note.createdLat.toFixed(2)}, {note.createdLng.toFixed(2)}
            </span>
          )}
        </div>
        <div ref={colorRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setColorOpen(!colorOpen)}
            aria-label="Seleccionar color de nota"
            aria-expanded={colorOpen}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '2px solid rgba(0,0,0,0.12)',
              background: note.color || NOTE_COLORS[0],
              cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}
            title="Color de nota"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
              <path d="M20 2L9 13l2 2L22 4l-2-2z"/>
              <path d="M3 18l2-2 3 3-2 2-3-3z"/>
              <path d="M5 16l-2 5 5-2"/>
            </svg>
          </button>
          {colorOpen && (
            <div style={{
              position: 'absolute', bottom: '100%', right: 0, marginBottom: 6,
              zIndex: 20, background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              padding: 10, width: 180, display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)', gap: 4,
              animation: 'fadeIn 0.1s ease',
            }}>
              {NOTE_COLORS.map((c, i) => (
                <button
                  key={c}
                  onClick={() => { updateNote(note.id, { color: c }); setColorOpen(false); }}
                  aria-label={`Color de fondo ${i + 1}`}
                  style={{
                    width: 24, height: 24, borderRadius: '50%',
                    border: c === (note.color || NOTE_COLORS[0])
                      ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: c, cursor: 'pointer',
                    transition: 'all 0.1s',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div
          onClick={() => setDeleteConfirm(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 9999, display: 'flex', alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', borderRadius: 12,
              padding: 28, maxWidth: 360, width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column', gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                Eliminar nota
              </h2>
              <button
                onClick={() => setDeleteConfirm(false)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
                  fontSize: 20, lineHeight: 1, padding: 4, display: 'flex',
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
              ¿Estás seguro de que quieres eliminar esta nota?
              {note?.deletedAt ? ' Esta acción no se puede deshacer.' : ' Se moverá a la papelera.'}
            </p>

            <button
              onClick={() => {
                if (note.deletedAt) {
                  permanentlyDeleteNote(note.id)
                } else {
                  deleteNote(note.id)
                }
                setActiveNote(null); setDeleteConfirm(false)
              }}
              style={{
                width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                background: 'var(--accent)', cursor: 'pointer', fontSize: 14,
                color: '#fff', fontWeight: 600,
              }}
            >
              {note?.deletedAt ? 'Eliminar permanentemente' : 'Mover a papelera'}
            </button>
          </div>
        </div>
      )}

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
              background: 'var(--surface)', borderRadius: 0, overflow: 'hidden',
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
              {([
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
              ] as const).map(([code, desc]) => (
                <button
                  key={code}
                  onClick={() => {
                    insertAtCursor(code + ' ')
                    setMarkdownHelpOpen(false)
                  }}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 2,
                    padding: '8px 10px', borderRadius: 0,
                    background: 'var(--bg)', fontSize: 13,
                    border: '1px solid transparent',
                    cursor: 'pointer', textAlign: 'left', color: 'inherit', fontFamily: 'inherit',
                    transition: 'border-color 0.1s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent' }}
                >
                  <code style={{ fontSize: 12, color: 'var(--accent)' }}>{code}</code>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', opacity: 0.7 }}>{desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
