import { useState, useEffect, useCallback, useRef } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Note } from '../../types'
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

interface NoteEditorProps {
  noteId: string
}

export default function NoteEditor({ noteId }: NoteEditorProps) {
  const notes = useNotesStore(s => s.notes)
  const updateNote = useNotesStore(s => s.updateNote)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const note = notes.find(n => n.id === noteId)

  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [emoji, setEmoji] = useState(note?.emoji ?? '📝')
  const [tagInput, setTagInput] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [preview, setPreview] = useState(note ? note.content.length > 0 : true)
  const emojiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setEmoji(note.emoji)
    }
  }, [note])

  useEffect(() => {
    if (!emojiOpen) return
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setEmojiOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [emojiOpen])

  const save = useCallback(() => {
    if (!note) return
    const tags = note.tags
    if (title !== note.title || content !== note.content || emoji !== note.emoji) {
      updateNote(note.id, { title, content, emoji, tags })
    }
  }, [note, title, content, emoji, updateNote])

  if (!note) return null

  const allTags = [...new Set(notes.filter(n => !n.deletedAt).flatMap(n => n.tags))]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div ref={emojiRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setEmojiOpen(!emojiOpen)}
            style={{
              width: 44, height: 44, borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg)', cursor: 'pointer',
              fontSize: 22, display: 'flex', alignItems: 'center',
              justifyContent: 'center', transition: 'all 0.15s',
            }}
          >
            {emoji}
          </button>
          {emojiOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 6,
              zIndex: 20, background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              padding: 10, width: 270, display: 'grid',
              gridTemplateColumns: 'repeat(9, 1fr)', gap: 2,
              animation: 'fadeIn 0.1s ease',
            }}>
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => { setEmoji(e); setEmojiOpen(false); updateNote(note.id, { emoji: e }); }}
                  style={{
                    width: 26, height: 26, borderRadius: 6, border: 'none',
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
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={save}
          placeholder="Título"
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', fontSize: 20, fontWeight: 700, outline: 'none',
          }}
        />
        <button
          onClick={() => setPreview(!preview)}
          style={{
            width: 44, height: 44, borderRadius: 10,
            border: `1px solid ${preview ? 'var(--accent)' : 'var(--border)'}`,
            background: preview ? 'var(--accent-light)' : 'var(--bg)',
            cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0,
            color: preview ? 'var(--accent)' : 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          title={preview ? 'Editar' : 'Vista previa'}
        >
          {preview ? '✏️' : '👁️'}
        </button>
        <button
          onClick={() => setActiveNote(null)}
          style={{
            width: 44, height: 44, borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--bg)', cursor: 'pointer',
            fontSize: 18, lineHeight: 1, flexShrink: 0,
            color: 'var(--text-secondary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          ✕
        </button>
      </div>

      {preview ? (
        <div style={{
          minHeight: 200, padding: 14, borderRadius: 10,
          border: '1px solid var(--border)', background: 'var(--bg)',
          color: 'var(--text)', fontSize: 14, lineHeight: 1.7,
          overflowY: 'auto',
        }}>
          <Markdown remarkPlugins={[remarkGfm]}>
            {content || '*Sin contenido*'}
          </Markdown>
        </div>
      ) : (
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onBlur={save}
          placeholder="Escribe tu nota aquí... (soporta **Markdown**)"
          style={{
            minHeight: 200, padding: 14, borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', fontSize: 14, lineHeight: 1.7,
            resize: 'vertical', outline: 'none', fontFamily: 'inherit',
          }}
        />
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {note.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 12, padding: '3px 10px', borderRadius: 12,
            background: 'var(--accent-light)', color: 'var(--accent)',
          }}>
            #{tag}
          </span>
        ))}
        <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && tagInput.trim()) {
                const newTags = [...note.tags, tagInput.trim().toLowerCase()]
                updateNote(note.id, { tags: newTags })
                setTagInput('')
              }
            }}
            placeholder="+ etiqueta"
            style={{
              padding: '3px 10px', borderRadius: 12, border: '1px dashed var(--border)',
              background: 'transparent', color: 'var(--text-secondary)',
              fontSize: 12, width: 90, outline: 'none',
            }}
          />
          {tagInput.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
                      color: 'var(--text)', transition: 'background 0.1s',
                    }}
                  >
                    #{t}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-secondary)', opacity: 0.5 }}>
        Creado {new Date(note.createdAt).toLocaleString()} · Última edición {new Date(note.updatedAt).toLocaleString()}
      </div>
    </div>
  )
}
