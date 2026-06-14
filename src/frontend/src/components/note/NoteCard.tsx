import { useState, type CSSProperties } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import type { Note } from '../../types'
import { useNotesStore } from '../../stores/notesStore'

interface NoteCardProps {
  note: Note
  burning?: boolean
  onClick: () => void
  onDelete: () => void
  onRestore?: () => void
}

const NOTE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  '#fff5f5': { bg: '#fff5f5', border: '#ffd4d4', text: '#5c2a2a' },
  '#fff8e8': { bg: '#fff8e8', border: '#f5e0b8', text: '#5c4a2a' },
  '#f0faf0': { bg: '#f0faf0', border: '#c8e6c9', text: '#2a5c2a' },
  '#e8f4fd': { bg: '#e8f4fd', border: '#b3d9f2', text: '#2a4a5c' },
  '#f5f0ff': { bg: '#f5f0ff', border: '#d4c8f0', text: '#3a2a5c' },
  '#fef0f5': { bg: '#fef0f5', border: '#f5c8d9', text: '#5c2a4a' },
  '#f0faf8': { bg: '#f0faf8', border: '#c8e8e0', text: '#2a4a42' },
  '#fff5e8': { bg: '#fff5e8', border: '#f0d4b8', text: '#5c3a2a' },
  '#f5f5f5': { bg: '#f5f5f5', border: '#e0e0e0', text: '#3a3a3a' },
  '#fffff0': { bg: '#fffff0', border: '#f0f0d8', text: '#4a4a2a' },
  '#f0f8ff': { bg: '#f0f8ff', border: '#c8e0f0', text: '#2a3a5c' },
  '#fdf5f0': { bg: '#fdf5f0', border: '#f0d8c8', text: '#5c3a2a' },
}

const DEFAULT_COLOR = '#fff8e8'

function getCardStyle(color?: string) {
  if (color && NOTE_COLORS[color]) return NOTE_COLORS[color]
  return NOTE_COLORS[DEFAULT_COLOR]
}

export default function NoteCard({ note, onClick, onDelete, onRestore, burning }: NoteCardProps) {
  const [crumpling, setCrumpling] = useState(false)
  const viewMode = useNotesStore(s => s.viewMode)
  const cardStyle = getCardStyle(note.color)
  const isTrashed = note.deletedAt !== null

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (crumpling) return
    setCrumpling(true)
    setTimeout(() => { onDelete() }, 500)
  }

  const crumpleStyle: CSSProperties = {}
  if (crumpling) {
    crumpleStyle.animation = 'crumpleOut 0.5s ease forwards'
  } else if (isTrashed) {
    crumpleStyle.filter = 'url(#crumple) grayscale(0.3)'
    crumpleStyle.opacity = 0.85
  }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: note.id,
    disabled: viewMode !== 'postit',
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 'auto',
    ...crumpleStyle,
  }

  if (viewMode === 'list') {
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={onClick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
        role="button"
        tabIndex={0}
        aria-label={`Nota: ${note.title || 'Sin título'}`}
        style={{
          ...style,
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', borderRadius: 0, cursor: 'grab',
          background: cardStyle.bg, border: `1px solid ${cardStyle.border}`,
          color: cardStyle.text, transition: 'all 0.15s',
          animation: burning ? 'burnOut 0.8s ease forwards' : undefined,
          overflow: burning ? 'hidden' : undefined,
        }}
      >
        {burning && (
          <>
            <div style={{
              position: 'absolute', inset: 0, zIndex: 5,
              background: 'linear-gradient(180deg, rgba(255,107,53,0.3) 0%, rgba(255,50,0,0.15) 50%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            <span style={{
              position: 'absolute', bottom: 4, left: '30%', zIndex: 6,
              fontSize: 16, pointerEvents: 'none',
              animation: 'fireRise 0.6s ease 0s forwards',
            }}>🔥</span>
          </>
        )}
        <span style={{ fontSize: 22, flexShrink: 0 }}>{note.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{note.title || 'Sin título'}</div>
          <div style={{ fontSize: 12, opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {note.content ? note.content.slice(0, 80) : '...'}
          </div>
        </div>
        <span style={{ fontSize: 11, opacity: 0.4, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {note.updatedLat != null && note.updatedLng != null && '📍 '}
          {note.author && <span style={{ marginRight: 4 }}>{note.author} · </span>}
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
        <button onClick={handleDelete} aria-label="Eliminar nota" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 18, opacity: 0.3, padding: '4px 6px', lineHeight: 1, color: cardStyle.text,
        }}>×</button>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      style={{
        ...style,
        position: 'relative',
        width: '100%', minHeight: 190, borderRadius: 0,
        background: cardStyle.bg, border: `1px solid ${cardStyle.border}`,
        padding: '18px 16px 14px', cursor: 'grab', color: cardStyle.text,
        display: 'flex', flexDirection: 'column',
        boxShadow: isDragging
          ? '0 12px 40px rgba(0,0,0,0.15)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        transition: `${transition || ''}, box-shadow 0.2s ease, transform 0.2s ease`,
        animation: burning ? 'burnOut 0.8s ease forwards' : undefined,
        overflow: burning ? 'hidden' : undefined,
      }}
      onMouseEnter={e => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'translateY(-3px)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
        }
      }}
      onMouseLeave={e => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
        }
      }}
    >
      {burning && (
        <>
          <div style={{
            position: 'absolute', inset: 0, zIndex: 5,
            background: 'linear-gradient(180deg, rgba(255,107,53,0.3) 0%, rgba(255,50,0,0.15) 50%, transparent 100%)',
            pointerEvents: 'none',
          }} />
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              position: 'absolute', bottom: 10, zIndex: 6,
              left: `${20 + i * 30}%`,
              fontSize: 20 + i * 4,
              pointerEvents: 'none',
              animation: `fireRise ${0.6 + i * 0.1}s ease ${i * 0.12}s forwards`,
            }}>🔥</span>
          ))}
        </>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 28, lineHeight: 1 }}>{note.emoji}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {onRestore && (
            <button
              onClick={e => { e.stopPropagation(); onRestore() }}
              aria-label="Restaurar nota"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 16, opacity: 0, padding: '4px 6px', lineHeight: 1,
                color: cardStyle.text, transition: 'opacity 0.15s',
              }}
              className="card-del"
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.6' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
            >↩</button>
          )}
          <button
            onClick={handleDelete}
            aria-label="Eliminar nota"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 18, opacity: 0, padding: '4px 6px', lineHeight: 1,
              color: cardStyle.text, transition: 'opacity 0.15s',
            }}
            className="card-del"
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.5' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
          >×</button>
        </div>
      </div>

      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, lineHeight: 1.3 }}>
        {note.title || 'Sin título'}
      </div>

      <div style={{
        fontSize: 12, opacity: 0.65, lineHeight: 1.5, flex: 1,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
      }}>
        {note.content || '...'}
      </div>

      {note.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
          {note.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 0,
              background: 'rgba(0,0,0,0.06)', opacity: 0.7,
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: 10, opacity: 0.35, marginTop: 10, textAlign: 'right' }}>
        {note.updatedLat != null && note.updatedLng != null && (
          <span title={`📍 ${note.updatedLat.toFixed(4)}, ${note.updatedLng.toFixed(4)}`} style={{ marginRight: 6 }}>
            📍
          </span>
        )}
        {note.author && <span style={{ marginRight: 4 }}>{note.author} · </span>}
        {new Date(note.updatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}
