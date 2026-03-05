import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth.store'

describe('auth.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('initial state', () => {
    it('should have null user by default', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
    })

    it('should read token from localStorage', () => {
      localStorage.setItem('expenso_token', 'saved-token')
      setActivePinia(createPinia())
      const store = useAuthStore()
      expect(store.token).toBe('saved-token')
    })

    it('should read refresh token from localStorage', () => {
      localStorage.setItem('expenso_refresh_token', 'saved-refresh')
      setActivePinia(createPinia())
      const store = useAuthStore()
      expect(store.refreshToken).toBe('saved-refresh')
    })

    it('should have null tokens when localStorage is empty', () => {
      const store = useAuthStore()
      expect(store.token).toBeNull()
      expect(store.refreshToken).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should be false when no token', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should be true when token exists', () => {
      const store = useAuthStore()
      store.setAuth({
        user: { id: '1', role: 'EMPLOYEE' },
        access_token: 'token',
        refresh_token: 'refresh',
      })
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('userRole', () => {
    it('should be null when no user', () => {
      const store = useAuthStore()
      expect(store.userRole).toBeNull()
    })

    it('should return user role', () => {
      const store = useAuthStore()
      store.setAuth({
        user: { id: '1', role: 'ADMIN' },
        access_token: 't',
        refresh_token: 'r',
      })
      expect(store.userRole).toBe('ADMIN')
    })
  })

  describe('userLocale', () => {
    it('should default to en-US when no user', () => {
      const store = useAuthStore()
      expect(store.userLocale).toBe('en-US')
    })

    it('should return user locale', () => {
      const store = useAuthStore()
      store.setAuth({
        user: { id: '1', role: 'EMPLOYEE', locale: 'pt-BR' },
        access_token: 't',
        refresh_token: 'r',
      })
      expect(store.userLocale).toBe('pt-BR')
    })
  })

  describe('forcePasswordReset', () => {
    it('should be false when no user', () => {
      const store = useAuthStore()
      expect(store.forcePasswordReset).toBe(false)
    })

    it('should return true when user has force_password_reset', () => {
      const store = useAuthStore()
      store.setAuth({
        user: { id: '1', role: 'EMPLOYEE', force_password_reset: true },
        access_token: 't',
        refresh_token: 'r',
      })
      expect(store.forcePasswordReset).toBe(true)
    })
  })

  describe('setAuth', () => {
    it('should set user, tokens and persist to localStorage', () => {
      const store = useAuthStore()
      const data = {
        user: { id: '1', full_name: 'Test', email: 'test@test.com', role: 'EMPLOYEE' },
        access_token: 'access-123',
        refresh_token: 'refresh-456',
      }
      store.setAuth(data)

      expect(store.user).toEqual(data.user)
      expect(store.token).toBe('access-123')
      expect(store.refreshToken).toBe('refresh-456')
      expect(localStorage.getItem('expenso_token')).toBe('access-123')
      expect(localStorage.getItem('expenso_refresh_token')).toBe('refresh-456')
    })
  })

  describe('clearAuth', () => {
    it('should clear user, tokens and localStorage', () => {
      const store = useAuthStore()
      store.setAuth({
        user: { id: '1', role: 'EMPLOYEE' },
        access_token: 'token',
        refresh_token: 'refresh',
      })

      store.clearAuth()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.refreshToken).toBeNull()
      expect(localStorage.getItem('expenso_token')).toBeNull()
      expect(localStorage.getItem('expenso_refresh_token')).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should merge data into existing user', () => {
      const store = useAuthStore()
      store.setAuth({
        user: { id: '1', full_name: 'Old Name', role: 'EMPLOYEE', locale: 'en-US' },
        access_token: 't',
        refresh_token: 'r',
      })

      store.updateUser({ full_name: 'New Name', locale: 'pt-BR' })

      expect(store.user.full_name).toBe('New Name')
      expect(store.user.locale).toBe('pt-BR')
      expect(store.user.id).toBe('1')
      expect(store.user.role).toBe('EMPLOYEE')
    })
  })

  describe('hasMinRole', () => {
    it('should return true when user role meets minimum', () => {
      const store = useAuthStore()
      store.setAuth({
        user: { id: '1', role: 'ADMIN' },
        access_token: 't',
        refresh_token: 'r',
      })
      expect(store.hasMinRole('EMPLOYEE')).toBe(true)
      expect(store.hasMinRole('MANAGER')).toBe(true)
      expect(store.hasMinRole('FINANCE')).toBe(true)
      expect(store.hasMinRole('ADMIN')).toBe(true)
    })

    it('should return false when user role is below minimum', () => {
      const store = useAuthStore()
      store.setAuth({
        user: { id: '1', role: 'EMPLOYEE' },
        access_token: 't',
        refresh_token: 'r',
      })
      expect(store.hasMinRole('EMPLOYEE')).toBe(true)
      expect(store.hasMinRole('MANAGER')).toBe(false)
      expect(store.hasMinRole('ADMIN')).toBe(false)
    })

    it('should return false when no user', () => {
      const store = useAuthStore()
      expect(store.hasMinRole('EMPLOYEE')).toBe(false)
    })
  })

  describe('hasRole', () => {
    it('should return true when user has one of the specified roles', () => {
      const store = useAuthStore()
      store.setAuth({
        user: { id: '1', role: 'MANAGER' },
        access_token: 't',
        refresh_token: 'r',
      })
      expect(store.hasRole('MANAGER', 'ADMIN')).toBe(true)
    })

    it('should return false when user role is not in list', () => {
      const store = useAuthStore()
      store.setAuth({
        user: { id: '1', role: 'EMPLOYEE' },
        access_token: 't',
        refresh_token: 'r',
      })
      expect(store.hasRole('MANAGER', 'ADMIN')).toBe(false)
    })

    it('should return false when no user', () => {
      const store = useAuthStore()
      expect(store.hasRole('EMPLOYEE')).toBe(false)
    })
  })
})
