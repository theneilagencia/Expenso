import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/http', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

import { authService } from '../auth'
import http from '@/services/http'

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should POST to /api/v1/auth/login', async () => {
      http.post.mockResolvedValue({ data: { access_token: 't' } })
      const result = await authService.login('test@test.com', 'pass')
      expect(http.post).toHaveBeenCalledWith('/api/v1/auth/login', {
        email: 'test@test.com',
        password: 'pass',
      })
      expect(result).toEqual({ access_token: 't' })
    })
  })

  describe('refresh', () => {
    it('should POST to /api/v1/auth/refresh', async () => {
      http.post.mockResolvedValue({ data: { access_token: 'new' } })
      const result = await authService.refresh('old-refresh')
      expect(http.post).toHaveBeenCalledWith('/api/v1/auth/refresh', {
        refresh_token: 'old-refresh',
      })
      expect(result).toEqual({ access_token: 'new' })
    })
  })

  describe('logout', () => {
    it('should POST to /api/v1/auth/logout', async () => {
      http.post.mockResolvedValue({ data: { message: 'ok' } })
      const result = await authService.logout()
      expect(http.post).toHaveBeenCalledWith('/api/v1/auth/logout')
      expect(result).toEqual({ message: 'ok' })
    })
  })

  describe('getMe', () => {
    it('should GET /api/v1/users/me', async () => {
      http.get.mockResolvedValue({ data: { id: '1', role: 'EMPLOYEE' } })
      const result = await authService.getMe()
      expect(http.get).toHaveBeenCalledWith('/api/v1/users/me')
      expect(result).toEqual({ id: '1', role: 'EMPLOYEE' })
    })
  })

  describe('updateMe', () => {
    it('should PATCH /api/v1/users/me', async () => {
      http.patch.mockResolvedValue({ data: { locale: 'pt-BR' } })
      const result = await authService.updateMe({ locale: 'pt-BR' })
      expect(http.patch).toHaveBeenCalledWith('/api/v1/users/me', { locale: 'pt-BR' })
      expect(result).toEqual({ locale: 'pt-BR' })
    })
  })

  describe('requestPasswordReset', () => {
    it('should POST to /api/v1/auth/password-reset/request', async () => {
      http.post.mockResolvedValue({ data: { message: 'sent' } })
      const result = await authService.requestPasswordReset('test@test.com')
      expect(http.post).toHaveBeenCalledWith('/api/v1/auth/password-reset/request', {
        email: 'test@test.com',
      })
      expect(result).toEqual({ message: 'sent' })
    })
  })

  describe('confirmPasswordReset', () => {
    it('should POST to /api/v1/auth/password-reset/confirm', async () => {
      http.post.mockResolvedValue({ data: { message: 'reset' } })
      const result = await authService.confirmPasswordReset('token123', 'newpass')
      expect(http.post).toHaveBeenCalledWith('/api/v1/auth/password-reset/confirm', {
        token: 'token123',
        new_password: 'newpass',
      })
      expect(result).toEqual({ message: 'reset' })
    })
  })

  describe('changePassword', () => {
    it('should POST to /api/v1/auth/change-password', async () => {
      http.post.mockResolvedValue({ data: { message: 'changed' } })
      const result = await authService.changePassword('oldpass', 'newpass')
      expect(http.post).toHaveBeenCalledWith('/api/v1/auth/change-password', {
        current_password: 'oldpass',
        new_password: 'newpass',
      })
      expect(result).toEqual({ message: 'changed' })
    })
  })

  describe('getSSOConfig', () => {
    it('should GET /api/v1/auth/sso/config', async () => {
      http.get.mockResolvedValue({ data: { providers: [] } })
      const result = await authService.getSSOConfig()
      expect(http.get).toHaveBeenCalledWith('/api/v1/auth/sso/config')
      expect(result).toEqual({ providers: [] })
    })
  })

  describe('ssoLogin', () => {
    it('should POST to /api/v1/auth/sso/login', async () => {
      http.post.mockResolvedValue({ data: { access_token: 'sso-token' } })
      const result = await authService.ssoLogin('google', 'auth-code')
      expect(http.post).toHaveBeenCalledWith('/api/v1/auth/sso/login', {
        provider: 'google',
        code: 'auth-code',
        redirect_uri: `${window.location.origin}/auth/callback`,
      })
      expect(result).toEqual({ access_token: 'sso-token' })
    })
  })
})
