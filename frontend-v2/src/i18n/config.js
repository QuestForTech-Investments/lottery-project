import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import es from './locales/es.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ht from './locales/ht.json'

const resources = {
  es: { translation: es },
  en: { translation: en },
  fr: { translation: fr },
  ht: { translation: ht }
}

i18n
  .use(LanguageDetector) // Detecta el idioma del navegador
  .use(initReactI18next) // Pasa i18n a react-i18next
  .init({
    resources,
    lng: 'es', // Idioma inicial por defecto
    fallbackLng: 'es', // Idioma de respaldo
    supportedLngs: ['es', 'en', 'fr', 'ht'], // Idiomas soportados
    interpolation: {
      escapeValue: false // React ya protege contra XSS
    },
    detection: {
      // Orden de detección: localStorage > español por defecto
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Guarda la preferencia del usuario
      lookupLocalStorage: 'i18nextLng' // Clave para localStorage
    }
  })

export default i18n

