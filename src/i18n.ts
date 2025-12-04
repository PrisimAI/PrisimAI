import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import zh from './locales/zh.json'
import hi from './locales/hi.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'
import bn from './locales/bn.json'
import pt from './locales/pt.json'
import ru from './locales/ru.json'
import ur from './locales/ur.json'

// Language configurations with native names
export const languages = {
  en: { name: 'English', nativeName: 'English' },
  zh: { name: 'Chinese', nativeName: '中文' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  es: { name: 'Spanish', nativeName: 'Español' },
  fr: { name: 'French', nativeName: 'Français' },
  ar: { name: 'Arabic', nativeName: 'العربية' },
  bn: { name: 'Bengali', nativeName: 'বাংলা' },
  pt: { name: 'Portuguese', nativeName: 'Português' },
  ru: { name: 'Russian', nativeName: 'Русский' },
  ur: { name: 'Urdu', nativeName: 'اردو' },
} as const

export type Language = keyof typeof languages

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  hi: { translation: hi },
  es: { translation: es },
  fr: { translation: fr },
  ar: { translation: ar },
  bn: { translation: bn },
  pt: { translation: pt },
  ru: { translation: ru },
  ur: { translation: ur },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

export default i18n
