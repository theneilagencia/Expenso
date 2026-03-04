import { createI18n } from 'vue-i18n'

const loadLocaleMessages = () => {
  const locales = import.meta.glob('./locales/**/*.json', { eager: true })
  const messages = {}
  for (const path in locales) {
    const match = path.match(/locales\/([\w-]+)\/(\w+)\.json/)
    if (match) {
      const [, locale, module] = match
      if (!messages[locale]) messages[locale] = {}
      messages[locale][module] = locales[path].default
    }
  }
  return messages
}

export const SUPPORTED_LOCALES = [
  { code: 'en-US', label: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'pt-BR', label: 'Portugu\u00EAs', flag: '\u{1F1E7}\u{1F1F7}' }
]

export const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: loadLocaleMessages()
})
