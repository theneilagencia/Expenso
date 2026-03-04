import http from '@/services/http'

export const adminCategoriesService = {
  async list() {
    const { data } = await http.get('/api/v1/admin/categories')
    return data
  },

  async create(payload) {
    const { data } = await http.post('/api/v1/admin/categories', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await http.patch(`/api/v1/admin/categories/${id}`, payload)
    return data
  },

  async remove(id) {
    const { data } = await http.delete(`/api/v1/admin/categories/${id}`)
    return data
  }
}
