import { useNotesStore } from '../../stores/notesStore'
import { useUIStore } from '../../stores/uiStore'
import SearchBar from '../sidebar/SearchBar'

export default function Header() {
  const viewMode = useNotesStore(s => s.viewMode)
  const setViewMode = useNotesStore(s => s.setViewMode)
  const theme = useUIStore(s => s.theme)
  const setTheme = useUIStore(s => s.setTheme)

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 56, background: 'var(--surface)',
      borderBottom: '1px solid var(--border)', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>📝</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
          Notas
        </span>
      </div>

      <div style={{ flex: 1, maxWidth: 360, margin: '0 auto' }}>
        <SearchBar />
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => setViewMode(viewMode === 'postit' ? 'list' : 'postit')}
          style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)',
            background: viewMode === 'list' ? 'var(--accent)' : 'transparent',
            color: viewMode === 'list' ? '#fff' : 'var(--text)',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
            transition: 'all 0.15s',
          }}
        >
          {viewMode === 'postit' ? '☰ Lista' : '⊞ Post-It'}
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text)',
            cursor: 'pointer', fontSize: 15, transition: 'all 0.15s',
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
