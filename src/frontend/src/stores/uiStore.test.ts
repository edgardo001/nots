import { describe, it, expect, beforeEach, vi } from 'vitest'

let storedTheme: string | null = null

vi.mock('../db/operations', () => ({
  getSetting: vi.fn(() => storedTheme ? Promise.resolve({ key: 'app:theme', value: storedTheme }) : Promise.resolve(undefined)),
  setSetting: vi.fn((_key: string, value: string) => { storedTheme = value; return Promise.resolve() }),
}))

import { useUIStore, themeCycle } from './uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    storedTheme = null
    useUIStore.setState({
      theme: 'system',
      resolvedTheme: 'light',
      sidebarOpen: false,
      showTrash: false,
      showSettings: false,
    })
  })

  it('loadTheme defaults to system', async () => {
    await useUIStore.getState().loadTheme()
    const state = useUIStore.getState()
    expect(state.theme).toBe('system')
    expect(state.resolvedTheme).toBe('light')
  })

  it('setTheme changes theme and resolvedTheme', async () => {
    await useUIStore.getState().setTheme('dark')
    const state = useUIStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.resolvedTheme).toBe('dark')
  })

  it('setTheme persists to settings', async () => {
    await useUIStore.getState().setTheme('dark')
    expect(storedTheme).toBe('dark')
  })

  it('toggleSidebar toggles sidebar state', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(false)
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(false)
  })

  it('setSidebarOpen sets sidebar explicitly', () => {
    useUIStore.getState().setSidebarOpen(true)
    expect(useUIStore.getState().sidebarOpen).toBe(true)
    useUIStore.getState().setSidebarOpen(false)
    expect(useUIStore.getState().sidebarOpen).toBe(false)
  })

  it('setShowTrash toggles trash view', () => {
    useUIStore.getState().setShowTrash(true)
    expect(useUIStore.getState().showTrash).toBe(true)
  })
})

describe('themeCycle', () => {
  it('cycles light → dark → system → light', () => {
    expect(themeCycle('light')).toBe('dark')
    expect(themeCycle('dark')).toBe('system')
    expect(themeCycle('system')).toBe('light')
  })
})
