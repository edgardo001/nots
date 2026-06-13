import { create } from 'zustand';
import { getSetting, setSetting } from '../db/operations';

const THEME_KEY = 'app:theme';

function resolveTheme(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', resolved);
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    meta.setAttribute('content', resolved);
  } else {
    const m = document.createElement('meta');
    m.name = 'color-scheme';
    m.content = resolved;
    document.head.appendChild(m);
  }
}

let systemListener: (() => void) | null = null;

function listenSystem(setStore: (resolved: 'light' | 'dark') => void) {
  if (systemListener) systemListener();
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => setStore(e.matches ? 'dark' : 'light');
  mq.addEventListener('change', handler);
  systemListener = () => mq.removeEventListener('change', handler);
}

interface UIState {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  sidebarOpen: boolean;
  showTrash: boolean;
  showSettings: boolean;

  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setShowTrash: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  loadTheme: () => Promise<void>;
}

function themeCycle(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' | 'system' {
  const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
  const idx = order.indexOf(theme);
  return order[(idx + 1) % order.length];
}

export { themeCycle };

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  resolvedTheme: 'light',
  sidebarOpen: false,
  showTrash: false,
  showSettings: false,

  setTheme: async (theme) => {
    await setSetting(THEME_KEY, theme);
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });
    if (theme === 'system') {
      listenSystem((r) => {
        applyTheme(r);
        set({ resolvedTheme: r });
      });
    } else if (systemListener) {
      systemListener();
      systemListener = null;
    }
  },

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setShowTrash: (show) => set({ showTrash: show }),

  setShowSettings: (show) => set({ showSettings: show }),

  loadTheme: async () => {
    const setting = await getSetting(THEME_KEY);
    const theme: 'light' | 'dark' | 'system' = (setting?.value as 'light' | 'dark' | 'system') ?? 'system';
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });
    if (theme === 'system') {
      listenSystem((r) => {
        applyTheme(r);
        set({ resolvedTheme: r });
      });
    }
  },
}));
