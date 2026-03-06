import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUIStore } from '../ui.store'

describe('ui.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('initial state', () => {
    it('should have sidebar open by default', () => {
      const store = useUIStore()
      expect(store.sidebarOpen).toBe(true)
    })

    it('should have loading as false by default', () => {
      const store = useUIStore()
      expect(store.loading).toBe(false)
    })

    it('should default locale to en-US when localStorage is empty', () => {
      const store = useUIStore()
      expect(store.locale).toBe('en-US')
    })

    it('should read locale from localStorage if set', () => {
      localStorage.setItem('expenso_locale', 'pt-BR')
      setActivePinia(createPinia())
      const store = useUIStore()
      expect(store.locale).toBe('pt-BR')
    })
  })

  describe('toggleSidebar', () => {
    it('should toggle sidebar from open to closed', () => {
      const store = useUIStore()
      expect(store.sidebarOpen).toBe(true)
      store.toggleSidebar()
      expect(store.sidebarOpen).toBe(false)
    })

    it('should toggle sidebar from closed to open', () => {
      const store = useUIStore()
      store.toggleSidebar() // close
      store.toggleSidebar() // open
      expect(store.sidebarOpen).toBe(true)
    })
  })

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const store = useUIStore()
      store.setLoading(true)
      expect(store.loading).toBe(true)
    })

    it('should set loading to false', () => {
      const store = useUIStore()
      store.setLoading(true)
      store.setLoading(false)
      expect(store.loading).toBe(false)
    })
  })

  describe('setLocale', () => {
    it('should update locale to pt-BR', () => {
      const store = useUIStore()
      store.setLocale('pt-BR')
      expect(store.locale).toBe('pt-BR')
    })

    it('should persist locale to localStorage', () => {
      const store = useUIStore()
      store.setLocale('pt-BR')
      expect(localStorage.getItem('expenso_locale')).toBe('pt-BR')
    })

    it('should allow switching back to en-US', () => {
      const store = useUIStore()
      store.setLocale('pt-BR')
      store.setLocale('en-US')
      expect(store.locale).toBe('en-US')
      expect(localStorage.getItem('expenso_locale')).toBe('en-US')
    })
  })
})
