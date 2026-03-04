import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUIStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'

export function useLocale() {
  const { locale } = useI18n()
  const uiStore = useUIStore()
  const authStore = useAuthStore()

  function setLocale(code) {
    locale.value = code
    uiStore.setLocale(code)
    document.documentElement.lang = code
  }

  function initLocale() {
    const userLocale = authStore.user?.locale
    const stored = localStorage.getItem('expenso_locale')
    const initial = userLocale || stored || 'en-US'
    setLocale(initial)
  }

  watch(() => authStore.user?.locale, (newLocale) => {
    if (newLocale) setLocale(newLocale)
  })

  return { setLocale, initLocale, currentLocale: locale }
}
