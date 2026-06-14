import type { CSSProperties } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import type { Note } from '../../types'
import { useNotesStore } from '../../stores/notesStore'
import { useT } from '../../i18n'

interface NoteListProps {
  notes: Note[]
  activeNoteId: string | null
  onSelectNote: (id: string) => void
}

function SortableItem({ note, activeNoteId, onSelectNote }: {
  note: Note
  activeNoteId: string | null
  onSelectNote: (id: string) => void
}) {
  const t_ = useT()
  const viewMode = useNotesStore(s => s.viewMode)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: note.id,
    disabled: viewMode !== 'list',
  })

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onSelectNote(note.id)}
      style={{
        ...style,
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '7px 10px', marginBottom: 1,
        borderRadius: 6, border: 'none',
        background: note.id === activeNoteId ? 'var(--accent-light)' : 'transparent',
        color: note.id === activeNoteId ? 'var(--accent)' : 'var(--text)',
        cursor: viewMode === 'list' ? 'grab' : 'pointer', textAlign: 'left',
        transition: `${transition || ''}, background 0.1s`,
        fontSize: 13,
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{note.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '12px',
        }}>
          {note.title || t_('card.untitled')}
        </div>
      </div>
    </button>
  )
}

export default function NoteList({ notes, activeNoteId, onSelectNote }: NoteListProps) {
  return (
    <div>
      {notes.map(note => (
        <SortableItem
          key={note.id}
          note={note}
          activeNoteId={activeNoteId}
          onSelectNote={onSelectNote}
        />
      ))}
    </div>
  )
}
