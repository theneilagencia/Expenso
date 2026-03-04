import http from '@/services/http'

export const adminIntegrationsService = {
  async list() {
    const { data } = await http.get('/api/v1/admin/integrations')
    return data
  },

  async create(payload) {
    const { data } = await http.post('/api/v1/admin/integrations', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await http.patch(`/api/v1/admin/integrations/${id}`, payload)
    return data
  },

  async remove(id) {
    const { data } = await http.delete(`/api/v1/admin/integrations/${id}`)
    return data
  },

  async test(id) {
    const { data } = await http.post(`/api/v1/admin/integrations/${id}/test`)
    return data
  }
}
