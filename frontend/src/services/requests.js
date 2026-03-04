import http from '@/services/http'

export const requestsService = {
  async list(params = {}) {
    const { data } = await http.get('/api/v1/requests', { params })
    return data
  },

  async getById(id) {
    const { data } = await http.get(`/api/v1/requests/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await http.post('/api/v1/requests', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await http.patch(`/api/v1/requests/${id}`, payload)
    return data
  },

  async submit(id) {
    const { data } = await http.post(`/api/v1/requests/${id}/submit`)
    return data
  },

  async approve(id, payload = {}) {
    const { data } = await http.post(`/api/v1/requests/${id}/approve`, payload)
    return data
  },

  async reject(id, payload) {
    const { data } = await http.post(`/api/v1/requests/${id}/reject`, payload)
    return data
  },

  async requestEdit(id, payload) {
    const { data } = await http.post(`/api/v1/requests/${id}/request-edit`, payload)
    return data
  },

  async cancel(id) {
    const { data } = await http.post(`/api/v1/requests/${id}/cancel`)
    return data
  },

  async getAuditLog(id) {
    const { data } = await http.get(`/api/v1/requests/${id}/audit-log`)
    return data
  },

  async getVersions(id) {
    const { data } = await http.get(`/api/v1/requests/${id}/versions`)
    return data
  }
}
