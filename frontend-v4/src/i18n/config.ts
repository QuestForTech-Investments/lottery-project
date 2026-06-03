import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import es from './locales/es.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ht from './locales/ht.json'
import { tenantConfig } from '../tenant'

const resources = {
  es: { translation: es },
  en: { translation: en },
  fr: { translation: fr },
  ht: { translation: ht }
}

// Default language is tenant-specific (set in themes/<tenant>/config.ts).
// localStorage still wins when present, so a user's manual choice survives
// across visits regardless of the tenant default.
const defaultLng = tenantConfig.defaultLanguage ?? 'es'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLng,
    fallbackLng: defaultLng,
    supportedLngs: ['es', 'en', 'fr', 'ht'],
    interpolation: {
      escapeValue: false // React already escapes against XSS
    },
    detection: {
      // localStorage > tenant default. Browser navigator is intentionally
      // omitted so visitors hitting La Central from a non-English browser
      // still land on the tenant's English default.
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    }
  })

export default i18n

