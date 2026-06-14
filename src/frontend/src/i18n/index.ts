import es from './es'
import en from './en'
import { useLocaleStore } from '../stores/localeStore'

export interface Translations {
  [key: string]: string
}

const locales: Record<string, Translations> = { es, en }

export function t(key: string, params?: Record<string, string | number>): string {
  const locale = useLocaleStore.getState().locale
  const translations = locales[locale] || es
  let value = translations[key]
  if (value === undefined) {
    value = es[key]
  }
  if (value === undefined) return key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v))
    }
  }
  return value
}

export function useT() {
  const locale = useLocaleStore(s => s.locale)
  return (key: string, params?: Record<string, string | number>) => {
    const translations = locale === 'en' ? en : es
    let value = translations[key]
    if (value === undefined) value = (locale === 'es' ? en : es)[key]
    if (value === undefined) return key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v))
      }
    }
    return value
  }
}
