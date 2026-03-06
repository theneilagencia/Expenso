import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationsStore } from '../notifications.store'

describe('notifications.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('should have an empty notifications array', () => {
      const store = useNotificationsStore()
      expect(store.notifications).toEqual([])
    })

    it('should have unreadCount of 0', () => {
      const store = useNotificationsStore()
      expect(store.unreadCount).toBe(0)
    })
  })

  describe('setNotifications', () => {
    it('should replace the notifications list', () => {
      const store = useNotificationsStore()
      const data = [
        { id: '1', message: 'Request approved', is_read: false },
        { id: '2', message: 'Payment processed', is_read: true },
      ]
      store.setNotifications(data)
      expect(store.notifications).toHaveLength(2)
      expect(store.notifications[0].message).toBe('Request approved')
    })

    it('should overwrite previous notifications', () => {
      const store = useNotificationsStore()
      store.setNotifications([{ id: '1', message: 'Old', is_read: false }])
      store.setNotifications([{ id: '2', message: 'New', is_read: false }])
      expect(store.notifications).toHaveLength(1)
      expect(store.notifications[0].id).toBe('2')
    })
  })

  describe('unreadCount', () => {
    it('should count only unread notifications', () => {
      const store = useNotificationsStore()
      store.setNotifications([
        { id: '1', is_read: false },
        { id: '2', is_read: true },
        { id: '3', is_read: false },
      ])
      expect(store.unreadCount).toBe(2)
    })

    it('should return 0 when all are read', () => {
      const store = useNotificationsStore()
      store.setNotifications([
        { id: '1', is_read: true },
        { id: '2', is_read: true },
      ])
      expect(store.unreadCount).toBe(0)
    })
  })

  describe('markAsRead', () => {
    it('should mark a specific notification as read', () => {
      const store = useNotificationsStore()
      store.setNotifications([
        { id: '1', is_read: false },
        { id: '2', is_read: false },
      ])
      store.markAsRead('1')
      expect(store.notifications[0].is_read).toBe(true)
      expect(store.notifications[1].is_read).toBe(false)
    })

    it('should not throw when id does not exist', () => {
      const store = useNotificationsStore()
      store.setNotifications([{ id: '1', is_read: false }])
      expect(() => store.markAsRead('nonexistent')).not.toThrow()
      expect(store.notifications[0].is_read).toBe(false)
    })

    it('should update unreadCount after marking as read', () => {
      const store = useNotificationsStore()
      store.setNotifications([
        { id: '1', is_read: false },
        { id: '2', is_read: false },
      ])
      expect(store.unreadCount).toBe(2)
      store.markAsRead('1')
      expect(store.unreadCount).toBe(1)
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      const store = useNotificationsStore()
      store.setNotifications([
        { id: '1', is_read: false },
        { id: '2', is_read: false },
        { id: '3', is_read: false },
      ])
      store.markAllAsRead()
      expect(store.notifications.every(n => n.is_read)).toBe(true)
    })

    it('should set unreadCount to 0', () => {
      const store = useNotificationsStore()
      store.setNotifications([
        { id: '1', is_read: false },
        { id: '2', is_read: false },
      ])
      store.markAllAsRead()
      expect(store.unreadCount).toBe(0)
    })
  })
})
