import { useNotesStore } from '../../stores/notesStore'
import { useUIStore } from '../../stores/uiStore'

export default function SearchBar() {
  const searchQuery = useNotesStore(s => s.searchQuery)
  const setSearchQuery = useNotesStore(s => s.setSearchQuery)

  return (
    <div style={{ position: 'relative', width: '100%' }} role="search" aria-label="Buscar notas">
      <svg style={{
        position: 'absolute', left: 12, top: '50%',
        transform: 'translateY(-50%)', opacity: 0.3,
        pointerEvents: 'none',
      }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="search"
        data-search-input
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Buscar notas... (Ctrl+F)"
        aria-label="Buscar notas"
        style={{
          width: '100%', padding: '8px 12px 8px 34px',
          borderRadius: 0, border: '1px solid var(--border)',
          background: 'var(--bg)', color: 'var(--text)',
          fontSize: 13, outline: 'none',
          transition: 'all 0.15s',
        }}
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          aria-label="Limpiar búsqueda"
          style={{
            position: 'absolute', right: 10, top: '50%',
            transform: 'translateY(-50%)', background: 'none',
            border: 'none', cursor: 'pointer', fontSize: 14,
            opacity: 0.3, padding: 2, lineHeight: 1, color: 'var(--text)',
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
