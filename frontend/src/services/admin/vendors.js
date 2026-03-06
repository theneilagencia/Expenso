import http from '@/services/http'

export const adminVendorsService = {
  async list(params = {}) {
    const { data } = await http.get('/api/v1/admin/vendors', { params })
    return data
  },

  async create(payload) {
    const { data } = await http.post('/api/v1/admin/vendors', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await http.patch(`/api/v1/admin/vendors/${id}`, payload)
    return data
  },

  async remove(id) {
    const { data } = await http.delete(`/api/v1/admin/vendors/${id}`)
    return data
  }
}
