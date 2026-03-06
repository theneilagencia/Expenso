import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/http', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

import { notificationsService } from '../notifications'
import http from '@/services/http'

describe('notificationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should GET /api/v1/notifications with params', async () => {
      http.get.mockResolvedValue({ data: { items: [{ id: '1' }], meta: {} } })
      const result = await notificationsService.list({ page: 1, per_page: 20 })
      expect(http.get).toHaveBeenCalledWith('/api/v1/notifications', {
        params: { page: 1, per_page: 20 },
      })
      expect(result.items).toHaveLength(1)
    })

    it('should GET /api/v1/notifications with default empty params', async () => {
      http.get.mockResolvedValue({ data: [] })
      await notificationsService.list()
      expect(http.get).toHaveBeenCalledWith('/api/v1/notifications', { params: {} })
    })
  })

  describe('markAsRead', () => {
    it('should PATCH /api/v1/notifications/:id/read', async () => {
      http.patch.mockResolvedValue({ data: { id: 'n-1', is_read: true } })
      const result = await notificationsService.markAsRead('n-1')
      expect(http.patch).toHaveBeenCalledWith('/api/v1/notifications/n-1/read')
      expect(result.is_read).toBe(true)
    })
  })

  describe('markAllAsRead', () => {
    it('should POST /api/v1/notifications/read-all', async () => {
      http.post.mockResolvedValue({ data: { message: 'ok', count: 5 } })
      const result = await notificationsService.markAllAsRead()
      expect(http.post).toHaveBeenCalledWith('/api/v1/notifications/read-all')
      expect(result.message).toBe('ok')
    })
  })

  describe('getUnreadCount', () => {
    it('should GET /api/v1/notifications/unread-count', async () => {
      http.get.mockResolvedValue({ data: { count: 3 } })
      const result = await notificationsService.getUnreadCount()
      expect(http.get).toHaveBeenCalledWith('/api/v1/notifications/unread-count')
      expect(result.count).toBe(3)
    })

    it('should return zero count when no unread', async () => {
      http.get.mockResolvedValue({ data: { count: 0 } })
      const result = await notificationsService.getUnreadCount()
      expect(result.count).toBe(0)
    })
  })

  describe('error handling', () => {
    it('should propagate errors from list', async () => {
      http.get.mockRejectedValue(new Error('Network Error'))
      await expect(notificationsService.list()).rejects.toThrow('Network Error')
    })

    it('should propagate errors from markAsRead', async () => {
      http.patch.mockRejectedValue(new Error('Not Found'))
      await expect(notificationsService.markAsRead('bad-id')).rejects.toThrow('Not Found')
    })
  })
})
