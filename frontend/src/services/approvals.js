import http from '@/services/http'

export const approvalsService = {
  async list(params = {}) {
    const { data } = await http.get('/api/v1/requests', {
      params: { ...params, pending_approval: true }
    })
    return data
  },

  async approve(requestId, payload = {}) {
    const { data } = await http.post(`/api/v1/requests/${requestId}/approve`, payload)
    return data
  },

  async reject(requestId, payload) {
    const { data } = await http.post(`/api/v1/requests/${requestId}/reject`, payload)
    return data
  },

  async requestEdit(requestId, payload) {
    const { data } = await http.post(`/api/v1/requests/${requestId}/request-edit`, payload)
    return data
  }
}
