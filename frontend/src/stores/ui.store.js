import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const sidebarOpen = ref(true)
  const loading = ref(false)
  const locale = ref(localStorage.getItem('expenso_locale') || 'en-US')

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setLocale(newLocale) {
    locale.value = newLocale
    localStorage.setItem('expenso_locale', newLocale)
  }

  function setLoading(value) {
    loading.value = value
  }

  return { sidebarOpen, loading, locale, toggleSidebar, setLocale, setLoading }
})
