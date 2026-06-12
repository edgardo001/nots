import { create } from 'zustand';
import { getSetting, setSetting } from '../db/operations';

const THEME_KEY = 'app:theme';

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

interface UIState {
  theme: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
  sidebarOpen: boolean;
  showTrash: boolean;
  showSettings: boolean;

  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  toggleSidebar: () => void;
  setShowTrash: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  loadTheme: () => Promise<void>;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  resolvedTheme: 'light',
  sidebarOpen: true,
  showTrash: false,
  showSettings: false,

  setTheme: async (theme) => {
    await setSetting(THEME_KEY, theme);
    applyTheme(theme);
    set({ theme, resolvedTheme: theme });
  },

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

  setShowTrash: (show) => set({ showTrash: show }),

  setShowSettings: (show) => set({ showSettings: show }),

  loadTheme: async () => {
    const setting = await getSetting(THEME_KEY);
    const theme: 'light' | 'dark' = (setting?.value as 'light' | 'dark') ?? 'light';
    applyTheme(theme);
    set({ theme, resolvedTheme: theme });
  },
}));
