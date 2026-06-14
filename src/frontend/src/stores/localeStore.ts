import { create } from 'zustand'
import { getSetting, setSetting } from '../db/operations'

export type Locale = 'es' | 'en'

interface LocaleState {
  locale: Locale
  loaded: boolean
  setLocale: (locale: Locale) => Promise<void>
  loadLocale: () => Promise<void>
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'es',
  loaded: false,

  setLocale: async (locale) => {
    await setSetting('app:locale', locale)
    set({ locale })
  },

  loadLocale: async () => {
    const setting = await getSetting('app:locale')
    const stored = setting?.value as Locale | undefined
    if (stored === 'es' || stored === 'en') {
      set({ locale: stored, loaded: true })
      return
    }
    const detected = navigator.language.startsWith('es') ? 'es' : 'en'
    set({ locale: detected, loaded: true })
    await setSetting('app:locale', detected)
  },
}))
