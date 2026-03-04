import http from '@/services/http'

export const notificationsService = {
  async list(params = {}) {
    const { data } = await http.get('/api/v1/notifications', { params })
    return data
  },

  async markAsRead(id) {
    const { data } = await http.patch(`/api/v1/notifications/${id}/read`)
    return data
  },

  async markAllAsRead() {
    const { data } = await http.post('/api/v1/notifications/read-all')
    return data
  },

  async getUnreadCount() {
    const { data } = await http.get('/api/v1/notifications/unread-count')
    return data
  }
}
