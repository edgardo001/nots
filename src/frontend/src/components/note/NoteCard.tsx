import type { CSSProperties } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import type { Note } from '../../types'
import { useNotesStore } from '../../stores/notesStore'

interface NoteCardProps {
  note: Note
  onClick: () => void
  onDelete: () => void
  onRestore?: () => void
}

const CARD_COLORS = [
  { bg: '#fff5f5', border: '#ffd4d4', text: '#5c2a2a' },
  { bg: '#fff8e8', border: '#f5e0b8', text: '#5c4a2a' },
  { bg: '#f0faf0', border: '#c8e6c9', text: '#2a5c2a' },
  { bg: '#e8f4fd', border: '#b3d9f2', text: '#2a4a5c' },
  { bg: '#f5f0ff', border: '#d4c8f0', text: '#3a2a5c' },
  { bg: '#fef0f5', border: '#f5c8d9', text: '#5c2a4a' },
  { bg: '#f0faf8', border: '#c8e8e0', text: '#2a4a42' },
  { bg: '#fff5e8', border: '#f0d4b8', text: '#5c3a2a' },
]

function getCardStyle(index: number) {
  return CARD_COLORS[index % CARD_COLORS.length]
}

export default function NoteCard({ note, onClick, onDelete, onRestore }: NoteCardProps) {
  const viewMode = useNotesStore(s => s.viewMode)
  const cardStyle = getCardStyle(note.position)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: note.id,
    disabled: viewMode !== 'postit',
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 'auto',
  }

  if (viewMode === 'list') {
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={onClick}
        style={{
          ...style,
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', borderRadius: 8, cursor: 'grab',
          background: cardStyle.bg, border: `1px solid ${cardStyle.border}`,
          color: cardStyle.text, transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>{note.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{note.title || 'Sin título'}</div>
          <div style={{ fontSize: 12, opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {note.content ? note.content.slice(0, 60) : '...'}
          </div>
        </div>
        <span style={{ fontSize: 11, opacity: 0.4, whiteSpace: 'nowrap' }}>
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
        <button onClick={e => { e.stopPropagation(); onDelete() }} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 16, opacity: 0.3, padding: 2, lineHeight: 1, color: cardStyle.text,
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
        width: 220, minHeight: 190, borderRadius: 12,
        background: cardStyle.bg, border: `1px solid ${cardStyle.border}`,
        padding: '18px 16px 14px', cursor: 'grab', color: cardStyle.text,
        display: 'flex', flexDirection: 'column',
        boxShadow: isDragging
          ? '0 12px 40px rgba(0,0,0,0.15)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        transition: `${transition || ''}, box-shadow 0.2s ease, transform 0.2s ease`,
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 26, lineHeight: 1 }}>{note.emoji}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {onRestore && (
            <button
              onClick={e => { e.stopPropagation(); onRestore() }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, opacity: 0, padding: 2, lineHeight: 1,
                color: cardStyle.text, transition: 'opacity 0.15s',
              }}
              className="card-del"
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.6' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
            >↩</button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, opacity: 0, padding: 2, lineHeight: 1,
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
              fontSize: 10, padding: '2px 8px', borderRadius: 10,
              background: 'rgba(0,0,0,0.06)', opacity: 0.7,
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: 10, opacity: 0.35, marginTop: 10, textAlign: 'right' }}>
        {new Date(note.updatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}
