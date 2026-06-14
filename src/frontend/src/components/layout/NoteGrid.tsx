import { useState, type CSSProperties } from 'react'
import {
  DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCenter,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, rectSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { useNotesStore } from '../../stores/notesStore'
import { useUIStore } from '../../stores/uiStore'
import { useT } from '../../i18n'
import NoteCard from '../note/NoteCard'

interface NoteGridProps {
  burning?: boolean
}

export default function NoteGrid({ burning }: NoteGridProps) {
  const t_ = useT()
  const notes = useNotesStore(s => s.notes)
  const trashNotes = useNotesStore(s => s.trashNotes)
  const searchQuery = useNotesStore(s => s.searchQuery)
  const sortField = useNotesStore(s => s.sortField)
  const sortOrder = useNotesStore(s => s.sortOrder)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const deleteNote = useNotesStore(s => s.deleteNote)
  const permanentlyDeleteNote = useNotesStore(s => s.permanentlyDeleteNote)
  const restoreNote = useNotesStore(s => s.restoreNote)
  const addNote = useNotesStore(s => s.addNote)
  const moveNote = useNotesStore(s => s.moveNote)
  const showTrash = useUIStore(s => s.showTrash)
  const viewMode = useNotesStore(s => s.viewMode)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const [activeId, setActiveId] = useState<string | null>(null)

  const source = showTrash ? trashNotes : notes
  let filtered = source
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = source.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'title') return sortOrder === 'desc' ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title)
    if (sortField === 'createdAt') return sortOrder === 'desc' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)
    return sortOrder === 'desc' ? b.updatedAt.localeCompare(a.updatedAt) : a.updatedAt.localeCompare(b.updatedAt)
  })

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const ids = sorted.map(n => n.id)
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    const reordered = arrayMove(ids, oldIndex, newIndex)

    reordered.forEach((id, idx) => moveNote(id, idx))
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  if (sorted.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '60%', color: 'var(--text-secondary)',
        gap: 12,
      }}>
        <span style={{ fontSize: 48, opacity: 0.3 }}>{showTrash ? '🗑️' : '📝'}</span>
        <div style={{ fontSize: 16, fontWeight: 500 }}>
          {showTrash ? t_('grid.trash_empty') : t_('grid.no_notes')}
        </div>
        {!showTrash && (
          <button
            onClick={() => { addNote().catch((err: unknown) => console.error('Error al crear nota:', err)) }}
            style={{
              padding: '10px 24px', borderRadius: 0,
              background: 'var(--accent)', color: '#fff',
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', marginTop: 4,
            }}
          >
            {t_('grid.create_first')}
          </button>
        )}
      </div>
    )
  }

  const enableDnd = !showTrash && viewMode === 'postit'
  const activeNote = activeId ? sorted.find(n => n.id === activeId) : null

  const cards = sorted.map(note => (
    <NoteCard
      key={note.id}
      note={note}
      burning={burning}
      onClick={() => setActiveNote(note.id)}
      onDelete={() => showTrash ? permanentlyDeleteNote(note.id) : deleteNote(note.id)}
      onRestore={showTrash ? () => restoreNote(note.id) : undefined}
    />
  ))

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
    animation: 'fadeIn 0.2s ease',
  }

  if (!enableDnd) {
    return <div style={gridStyle}>{cards}</div>
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <SortableContext items={sorted.map(n => n.id)} strategy={rectSortingStrategy}>
        <div style={gridStyle}>{cards}</div>
      </SortableContext>
      <DragOverlay>
        {activeNote ? (
          <div style={{
            width: 200, height: 190, borderRadius: 0,
            background: activeNote.color || '#fff8e8',
            border: '1px solid rgba(0,0,0,0.12)',
            padding: '18px 16px 14px',
            color: '#1a1a1a',
            display: 'flex', flexDirection: 'column',
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 999,
            opacity: 0.9,
            transform: 'rotate(2deg)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 10 }}>{activeNote.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, lineHeight: 1.3 }}>
              {activeNote.title || t_('card.untitled')}
            </div>
            <div style={{
              fontSize: 12, opacity: 0.65, lineHeight: 1.5, flex: 1,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            }}>
              {activeNote.content || '...'}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
