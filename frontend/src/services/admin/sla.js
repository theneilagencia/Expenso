import http from '@/services/http'

export const adminSlaService = {
  async list() {
    const { data } = await http.get('/api/v1/admin/sla')
    return data
  },

  async update(id, payload) {
    const { data } = await http.patch(`/api/v1/admin/sla/${id}`, payload)
    return data
  }
}
