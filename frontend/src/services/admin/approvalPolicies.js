import http from '@/services/http'

export const adminApprovalPoliciesService = {
  async list(params = {}) {
    const { data } = await http.get('/api/v1/admin/approval-policies', { params })
    return data
  },

  async create(payload) {
    const { data } = await http.post('/api/v1/admin/approval-policies', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await http.patch(`/api/v1/admin/approval-policies/${id}`, payload)
    return data
  },

  async remove(id) {
    const { data } = await http.delete(`/api/v1/admin/approval-policies/${id}`)
    return data
  }
}
