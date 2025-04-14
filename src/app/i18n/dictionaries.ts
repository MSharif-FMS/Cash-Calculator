import 'server-only'
import type { Locale } from './i18n-config'

// We enumerate all dictionaries here for better type safety
const dictionaries = {
  en: () => import('./locales/en.json').then((module) => module.default),
  ar: () => import('./locales/ar.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
