import http from '@/services/http'

export const adminHierarchyService = {
  async getTree() {
    const { data } = await http.get('/api/v1/admin/hierarchy')
    return data
  },

  async updateDepartmentParent(id, parentId) {
    const { data } = await http.patch(`/api/v1/admin/hierarchy/${id}`, { parent_id: parentId })
    return data
  }
}
