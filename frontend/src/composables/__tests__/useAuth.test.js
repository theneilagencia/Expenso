import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSetAuth = vi.fn()
const mockClearAuth = vi.fn()
const mockUpdateUser = vi.fn()
const mockRouterPush = vi.fn()

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => ({
    setAuth: mockSetAuth,
    clearAuth: mockClearAuth,
    updateUser: mockUpdateUser,
  }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

vi.mock('@/services/http', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import { useAuth } from '../useAuth'
import http from '@/services/http'

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should call API and set auth data', async () => {
      const responseData = {
        access_token: 'token',
        refresh_token: 'refresh',
        user: { id: '1', role: 'EMPLOYEE' },
      }
      http.post.mockResolvedValue({ data: responseData })

      const { login } = useAuth()
      const result = await login('test@test.com', 'password123')

      expect(http.post).toHaveBeenCalledWith('/api/v1/auth/login', {
        email: 'test@test.com',
        password: 'password123',
      })
      expect(mockSetAuth).toHaveBeenCalledWith(responseData)
      expect(result).toEqual(responseData)
    })

    it('should propagate errors on failed login', async () => {
      http.post.mockRejectedValue(new Error('Invalid credentials'))

      const { login } = useAuth()
      await expect(login('bad@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
      expect(mockSetAuth).not.toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('should call API, clear auth and redirect to login', async () => {
      http.post.mockResolvedValue({})

      const { logout } = useAuth()
      await logout()

      expect(http.post).toHaveBeenCalledWith('/api/v1/auth/logout')
      expect(mockClearAuth).toHaveBeenCalled()
      expect(mockRouterPush).toHaveBeenCalledWith({ name: 'login' })
    })

    it('should clear auth and redirect even if API fails', async () => {
      http.post.mockRejectedValue(new Error('Network error'))

      const { logout } = useAuth()
      // try/finally in logout propagates the error, but finally block still runs
      await logout().catch(() => {})

      expect(mockClearAuth).toHaveBeenCalled()
      expect(mockRouterPush).toHaveBeenCalledWith({ name: 'login' })
    })
  })

  describe('fetchMe', () => {
    it('should call API and update user', async () => {
      const userData = { id: '1', full_name: 'Test', email: 'test@test.com', role: 'EMPLOYEE' }
      http.get.mockResolvedValue({ data: userData })

      const { fetchMe } = useAuth()
      const result = await fetchMe()

      expect(http.get).toHaveBeenCalledWith('/api/v1/users/me')
      expect(mockUpdateUser).toHaveBeenCalledWith(userData)
      expect(result).toEqual(userData)
    })

    it('should propagate errors on failed fetch', async () => {
      http.get.mockRejectedValue(new Error('Unauthorized'))

      const { fetchMe } = useAuth()
      await expect(fetchMe()).rejects.toThrow('Unauthorized')
    })
  })
})
