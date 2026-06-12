import {
  DndContext, DragEndEvent, closestCenter,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { useNotesStore } from '../../stores/notesStore'
import { useUIStore } from '../../stores/uiStore'
import NoteList from '../sidebar/NoteList'
import type { SortField } from '../../types'

export default function Sidebar() {
  const notes = useNotesStore(s => s.notes)
  const activeNoteId = useNotesStore(s => s.activeNoteId)
  const sortField = useNotesStore(s => s.sortField)
  const sortOrder = useNotesStore(s => s.sortOrder)
  const searchQuery = useNotesStore(s => s.searchQuery)
  const addNote = useNotesStore(s => s.addNote)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const setSortField = useNotesStore(s => s.setSortField)
  const setSortOrder = useNotesStore(s => s.setSortOrder)
  const moveNote = useNotesStore(s => s.moveNote)
  const setShowTrash = useUIStore(s => s.setShowTrash)
  const showTrash = useUIStore(s => s.showTrash)
  const viewMode = useNotesStore(s => s.viewMode)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const activeNotes = notes.filter(n => !n.deletedAt)
  let filteredNotes = activeNotes
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filteredNotes = activeNotes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  const enableSidebarDnd = viewMode === 'list' && !showTrash

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = filteredNotes.map(n => n.id)
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    const reordered = arrayMove(ids, oldIndex, newIndex)
    reordered.forEach((id, idx) => moveNote(id, idx))
  }

  return (
    <aside style={{
      width: 280, minWidth: 280, height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
    }}>
      <div style={{ padding: '16px 12px 12px' }}>
        <button
          onClick={addNote}
          style={{
            width: '100%', padding: '10px 0', border: 'none',
            borderRadius: 10, background: 'var(--accent)', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          + Nueva Nota
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '0 12px 12px', alignItems: 'center' }}>
        <select
          value={sortField}
          onChange={e => setSortField(e.target.value as SortField)}
          style={{
            flex: 1, padding: '6px 8px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', fontSize: 12, cursor: 'pointer',
          }}
        >
          <option value="updatedAt">Actualizado</option>
          <option value="createdAt">Creado</option>
          <option value="title">Título</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)',
            background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer',
            fontSize: 13, lineHeight: 1,
          }}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {enableSidebarDnd ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredNotes.map(n => n.id)} strategy={verticalListSortingStrategy}>
              <NoteList
                notes={filteredNotes}
                activeNoteId={activeNoteId}
                onSelectNote={id => setActiveNote(id)}
              />
            </SortableContext>
          </DndContext>
        ) : (
          <NoteList
            notes={filteredNotes}
            activeNoteId={activeNoteId}
            onSelectNote={id => setActiveNote(id)}
          />
        )}
      </div>

      <button
        onClick={() => {
          const next = !showTrash
          setShowTrash(next)
          if (next) useNotesStore.getState().loadTrash()
          else useNotesStore.getState().loadNotes()
        }}
        style={{
          margin: 8, padding: '8px 16px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12,
          textAlign: 'left', transition: 'all 0.15s',
        }}
      >
        🗑 Papelera {showTrash ? '▲' : '▼'}
      </button>
    </aside>
  )
}
