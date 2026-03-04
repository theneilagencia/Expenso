import http from '@/services/http'

export const paymentsService = {
  async list(params = {}) {
    const { data } = await http.get('/api/v1/payments', { params })
    return data
  },

  async process(requestId, payload) {
    const { data } = await http.post(`/api/v1/payments/${requestId}`, payload)
    return data
  }
}
