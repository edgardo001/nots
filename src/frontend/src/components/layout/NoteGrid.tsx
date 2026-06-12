import type { CSSProperties } from 'react'
import {
  DndContext, DragEndEvent, closestCenter,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, rectSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { useNotesStore } from '../../stores/notesStore'
import { useUIStore } from '../../stores/uiStore'
import NoteCard from '../note/NoteCard'

export default function NoteGrid() {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const ids = sorted.map(n => n.id)
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    const reordered = arrayMove(ids, oldIndex, newIndex)

    reordered.forEach((id, idx) => moveNote(id, idx))
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
          {showTrash ? 'La papelera está vacía' : 'No hay notas todavía'}
        </div>
        {!showTrash && (
          <button
            onClick={addNote}
            style={{
              padding: '10px 24px', borderRadius: 10,
              background: 'var(--accent)', color: '#fff',
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', marginTop: 4,
            }}
          >
            + Crear primera nota
          </button>
        )}
      </div>
    )
  }

  const enableDnd = !showTrash && viewMode === 'postit'

  const cards = sorted.map(note => (
    <NoteCard
      key={note.id}
      note={note}
      onClick={() => setActiveNote(note.id)}
      onDelete={() => showTrash ? permanentlyDeleteNote(note.id) : deleteNote(note.id)}
      onRestore={showTrash ? () => restoreNote(note.id) : undefined}
    />
  ))

  const gridStyle: CSSProperties = {
    display: 'flex', flexWrap: 'wrap', gap: 16,
    animation: 'fadeIn 0.2s ease',
  }

  if (!enableDnd) {
    return <div style={gridStyle}>{cards}</div>
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sorted.map(n => n.id)} strategy={rectSortingStrategy}>
        <div style={gridStyle}>{cards}</div>
      </SortableContext>
    </DndContext>
  )
}
