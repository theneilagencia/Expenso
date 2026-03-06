import http from '@/services/http'

export const adminWebhooksService = {
  async list(params = {}) {
    const { data } = await http.get('/api/v1/admin/webhooks', { params })
    return data
  },

  async create(payload) {
    const { data } = await http.post('/api/v1/admin/webhooks', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await http.patch(`/api/v1/admin/webhooks/${id}`, payload)
    return data
  },

  async remove(id) {
    const { data } = await http.delete(`/api/v1/admin/webhooks/${id}`)
    return data
  },

  async test(id) {
    const { data } = await http.post(`/api/v1/admin/webhooks/${id}/test`)
    return data
  }
}
