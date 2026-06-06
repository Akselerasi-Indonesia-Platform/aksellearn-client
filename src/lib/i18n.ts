import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enTranslation from '../locales/en/translation.json'
import idTranslation from '../locales/id/translation.json'

const resources = {
  en: {
    translation: enTranslation,
  },
  id: {
    translation: idTranslation,
  },
}

const isServer = typeof window === 'undefined'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // Ensure the client starts with the same language as the server to prevent hydration mismatch
    // In production, we should ideally sync this via a cookie that the server can read.
    lng: isServer
      ? 'id'
      : typeof window !== 'undefined'
        ? (window as any).__ENV__?.LANGUAGE
        : 'id',
    fallbackLng: 'id',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
  })

export default i18n
