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
  const [colorFilter, setColorFilter] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [attachmentOnly, setAttachmentOnly] = useState<boolean>(false)
  const [attachmentMap, setAttachmentMap] = useState<Record<string, boolean>>({})
  const [filtersOpen, setFiltersOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const activeNotes = notes.filter(n => !n.deletedAt)

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
  if (tagFilter) filteredNotes = filteredNotes.filter(n => n.tags.includes(tagFilter))
  if (colorFilter) filteredNotes = filteredNotes.filter(n => n.color === colorFilter)
  if (dateFrom) filteredNotes = filteredNotes.filter(n => n.createdAt >= dateFrom)
  if (dateTo) filteredNotes = filteredNotes.filter(n => n.createdAt <= dateTo)
  if (attachmentOnly) filteredNotes = filteredNotes.filter(n => attachmentMap[n.id])
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filteredNotes = filteredNotes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  const allTags = [...new Set(activeNotes.flatMap(n => n.tags))].sort()
  const allColors = [...new Set(activeNotes.map(n => n.color))].sort()
  const enableSidebarDnd = viewMode === 'list' && !showTrash

  const activeFilterCount = [colorFilter, dateFrom, dateTo, attachmentOnly].filter(Boolean).length
  const clearAll = () => { setColorFilter(null); setDateFrom(''); setDateTo(''); setAttachmentOnly(false) }

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
      width: 260, minWidth: 260, height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
    }}>
      {/* Nueva nota */}
      <div style={{ padding: '16px 12px 10px' }}>
        <button
          onClick={addNote}
          aria-label="Crear nueva nota"
          style={{
            width: '100%', padding: '9px 0', border: 'none',
            borderRadius: 8, background: 'var(--accent)', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            letterSpacing: '0.02em', transition: 'opacity 0.15s',
          }}
        >
          + Nueva nota
        </button>
      </div>

      {/* Ordenar + Filtrar en una fila compacta */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 12px 10px',
      }}>
        {/* Orden */}
        <select
          value={sortField}
          onChange={e => setSortField(e.target.value as SortField)}
          aria-label="Ordenar notas por"
          style={{
            flex: 1, padding: '5px 6px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer',
            appearance: 'none', backgroundImage: 'none',
          }}
        >
          <option value="updatedAt">Recientes</option>
          <option value="createdAt">Creadas</option>
          <option value="title">A–Z</option>
        </select>

        {/* Asc/Desc */}
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          aria-label={sortOrder === 'asc' ? 'Orden descendente' : 'Orden ascendente'}
          title={sortOrder === 'asc' ? 'Más antiguo primero' : 'Más reciente primero'}
          style={{
            padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)',
            background: 'var(--bg)', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 12, lineHeight: 1, flexShrink: 0,
          }}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>

        {/* Botón filtros */}
        <button
          onClick={() => setFiltersOpen(o => !o)}
          aria-expanded={filtersOpen}
          aria-label="Mostrar filtros"
          title="Filtros"
          style={{
            padding: '5px 8px', borderRadius: 6, flexShrink: 0,
            border: `1px solid ${activeFilterCount > 0 ? 'var(--accent)' : 'var(--border)'}`,
            background: activeFilterCount > 0 ? 'var(--accent-light)' : 'var(--bg)',
            color: activeFilterCount > 0 ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 12, lineHeight: 1,
            display: 'flex', alignItems: 'center', gap: 4,
            transition: 'all 0.15s',
          }}
        >
          ⌥
          {activeFilterCount > 0 && (
            <span style={{
              background: 'var(--accent)', color: '#fff',
              borderRadius: 10, fontSize: 9, padding: '1px 5px',
              fontWeight: 700, lineHeight: 1.4,
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Panel de filtros colapsable */}
      {filtersOpen && (
        <div style={{
          margin: '0 12px 10px',
          border: '1px solid var(--border)',
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--bg)',
        }}>
          {/* Colores */}
          {allColors.length > 0 && (
            <div style={{
              padding: '8px 10px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', opacity: 0.6, minWidth: 40, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Color</span>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {allColors.map(col => (
                  <button
                    key={col}
                    onClick={() => setColorFilter(col === colorFilter ? null : col)}
                    aria-pressed={col === colorFilter}
                    title={col}
                    style={{
                      width: 16, height: 16,
                      background: col,
                      border: col === colorFilter ? '2px solid var(--accent)' : '1.5px solid rgba(0,0,0,0.12)',
                      borderRadius: 4,
                      cursor: 'pointer', padding: 0, flexShrink: 0,
                      transition: 'transform 0.1s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Fechas */}
          <div style={{
            padding: '8px 10px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', opacity: 0.6, minWidth: 40, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Fecha</span>
            <div style={{ display: 'flex', gap: 4, flex: 1, alignItems: 'center' }}>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                aria-label="Desde"
                style={{
                  flex: 1, border: '1px solid var(--border)', borderRadius: 4,
                  padding: '3px 4px', fontSize: 10,
                  background: 'var(--surface)', color: 'var(--text)',
                  minWidth: 0,
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', opacity: 0.4 }}>—</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                aria-label="Hasta"
                style={{
                  flex: 1, border: '1px solid var(--border)', borderRadius: 4,
                  padding: '3px 4px', fontSize: 10,
                  background: 'var(--surface)', color: 'var(--text)',
                  minWidth: 0,
                }}
              />
            </div>
          </div>

          {/* Adjuntos */}
          <label style={{
            padding: '8px 10px',
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer',
          }}>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', opacity: 0.6, minWidth: 40, letterSpacing: '0.04em', textTransform: 'uppercase' }}>📎</span>
            <input
              type="checkbox"
              checked={attachmentOnly}
              onChange={e => setAttachmentOnly(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Con adjuntos</span>
          </label>

          {/* Limpiar todo */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              style={{
                width: '100%', padding: '7px', border: 'none', borderTop: '1px solid var(--border)',
                background: 'transparent', color: 'var(--accent)',
                fontSize: 11, cursor: 'pointer', fontWeight: 500,
                transition: 'background 0.1s',
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Tags */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '0 12px 10px' }}>
          {tagFilter && (
            <button
              onClick={() => setTagFilter(null)}
              style={{
                padding: '3px 8px', borderRadius: 12,
                border: '1px solid var(--accent)', background: 'var(--accent-light)',
                color: 'var(--accent)', cursor: 'pointer', fontSize: 11, fontWeight: 600,
              }}
            >
              ✕
            </button>
          )}
          {allTags.slice(0, 8).map(tag => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              aria-pressed={tagFilter === tag}
              style={{
                padding: '3px 8px', borderRadius: 12,
                border: `1px solid ${tagFilter === tag ? 'var(--accent)' : 'var(--border)'}`,
                background: tagFilter === tag ? 'var(--accent)' : 'transparent',
                color: tagFilter === tag ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: 11, transition: 'all 0.15s',
              }}
            >
              #{tag}
            </button>
          ))}
          {allTags.length > 8 && (
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', opacity: 0.4, padding: '3px 4px' }}>
              +{allTags.length - 8}
            </span>
          )}
        </div>
      )}

      {/* Lista de notas */}
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

      {/* Papelera */}
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
          margin: 8, padding: '7px 12px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 11,
          textAlign: 'left', transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <span>🗑</span>
        <span>Papelera</span>
        <span style={{ marginLeft: 'auto', opacity: 0.5 }}>{showTrash ? '▲' : '▼'}</span>
      </button>
    </aside>
  )
}
