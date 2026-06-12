import {
  DndContext, DragEndEvent, closestCenter,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import { useNotesStore } from '../../stores/notesStore'
import { useUIStore } from '../../stores/uiStore'
import NoteList from '../sidebar/NoteList'
import type { SortField } from '../../types'
import { getAttachmentsForNote } from '../../db/operations'

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

  const [tagFilter, setTagFilter] = useState<string | null>(null)
  // Advanced filter states
  const [colorFilter, setColorFilter] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [attachmentOnly, setAttachmentOnly] = useState<boolean>(false)
  const [attachmentMap, setAttachmentMap] = useState<Record<string, boolean>>({})

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const activeNotes = notes.filter(n => !n.deletedAt)

  // Load attachment presence map when notes change
  useEffect(() => {
    const loadAttachments = async () => {
      const map: Record<string, boolean> = {}
      await Promise.all(
        activeNotes.map(async (note) => {
          const atts = await getAttachmentsForNote(note.id)
          map[note.id] = atts.length > 0
        })
      )
      setAttachmentMap(map)
    }
    loadAttachments()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes])

  let filteredNotes = activeNotes
  if (tagFilter) {
    filteredNotes = filteredNotes.filter(n => n.tags.includes(tagFilter))
  }
  // Color filter
  if (colorFilter) {
    filteredNotes = filteredNotes.filter(n => n.color === colorFilter)
  }
  // Date range filter (using createdAt)
  if (dateFrom) {
    filteredNotes = filteredNotes.filter(n => n.createdAt >= dateFrom)
  }
  if (dateTo) {
    filteredNotes = filteredNotes.filter(n => n.createdAt <= dateTo)
  }
  // Attachment filter
  if (attachmentOnly) {
    filteredNotes = filteredNotes.filter(n => attachmentMap[n.id])
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filteredNotes = filteredNotes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  const allTags = [...new Set(activeNotes.flatMap(n => n.tags))].sort()
  // Unique colors from notes for palette
  const allColors = [...new Set(activeNotes.map(n => n.color))].sort()

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

  const hasAdvancedFilters = colorFilter || dateFrom || dateTo || attachmentOnly

  return (
    <aside style={{
      width: 280, minWidth: 280, height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
    }}>
      <div style={{ padding: '16px 12px 12px' }}>
        <button
          onClick={addNote}
          aria-label="Crear nueva nota"
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

      {/* Sort controls */}
      <div style={{ display: 'flex', gap: 6, padding: '0 12px 12px', alignItems: 'center' }}>
        <select
          value={sortField}
          onChange={e => setSortField(e.target.value as SortField)}
          aria-label="Ordenar notas por"
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
          aria-label={sortOrder === 'asc' ? 'Cambiar a orden descendente' : 'Cambiar a orden ascendente'}
          style={{
            padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)',
            background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer',
            fontSize: 13, lineHeight: 1,
          }}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Advanced filter controls */}
      <div style={{ padding: '0 12px 10px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }} aria-label="Filtros avanzados">
          {/* Color palette */}
          {allColors.length > 0 && allColors.map(col => (
            <button
              key={col}
              onClick={() => setColorFilter(col === colorFilter ? null : col)}
              aria-pressed={col === colorFilter}
              title={`Filtrar por color ${col}`}
              style={{
                width: 18,
                height: 18,
                background: col,
                border: col === colorFilter ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 4,
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
            />
          ))}

          {/* Date range */}
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            aria-label="Fecha desde"
            style={{
              border: '1px solid var(--border)', borderRadius: 4,
              padding: '2px 4px', fontSize: 11,
              background: 'var(--bg)', color: 'var(--text)',
            }}
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            aria-label="Fecha hasta"
            style={{
              border: '1px solid var(--border)', borderRadius: 4,
              padding: '2px 4px', fontSize: 11,
              background: 'var(--bg)', color: 'var(--text)',
            }}
          />

          {/* Attachment toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={attachmentOnly}
              onChange={e => setAttachmentOnly(e.target.checked)}
            />
            📎 Adjuntos
          </label>

          {/* Clear advanced filters */}
          {hasAdvancedFilters && (
            <button
              onClick={() => { setColorFilter(null); setDateFrom(''); setDateTo(''); setAttachmentOnly(false) }}
              aria-label="Limpiar filtros avanzados"
              style={{
                padding: '2px 8px', borderRadius: 10, fontSize: 11,
                border: '1px solid var(--accent)', background: 'var(--accent-light)',
                color: 'var(--accent)', cursor: 'pointer',
              }}
            >
              ✕ Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0 12px 12px',
        }}>
          {tagFilter && (
            <button
              onClick={() => setTagFilter(null)}
              style={{
                padding: '3px 10px', borderRadius: 12,
                border: '1px solid var(--accent)', background: 'var(--accent-light)',
                color: 'var(--accent)', cursor: 'pointer', fontSize: 11,
                fontWeight: 600,
              }}
            >
              ✕ Limpiar
            </button>
          )}
          {allTags.slice(0, 8).map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              aria-pressed={tagFilter === tag}
              style={{
                padding: '3px 10px', borderRadius: 12,
                border: `1px solid ${tagFilter === tag ? 'var(--accent)' : 'var(--border)'}`,
                background: tagFilter === tag ? 'var(--accent)' : 'transparent',
                color: tagFilter === tag ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: 11,
                transition: 'all 0.15s',
              }}
            >
              #{tag}
            </button>
          ))}
          {allTags.length > 8 && (
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', opacity: 0.5, padding: '3px 6px' }}>
              +{allTags.length - 8}
            </span>
          )}
        </div>
      )}

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
        aria-label={showTrash ? 'Ocultar papelera' : 'Mostrar papelera'}
        aria-expanded={showTrash}
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
