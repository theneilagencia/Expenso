import http from '@/services/http'

export const reportsService = {
  async getDashboard(params = {}) {
    const { data } = await http.get('/api/v1/reports/dashboard', { params })
    return data
  },

  async getExpensesByCategory(params = {}) {
    const { data } = await http.get('/api/v1/reports/by-category', { params })
    return data
  },

  async getExpensesByDepartment(params = {}) {
    const { data } = await http.get('/api/v1/reports/by-department', { params })
    return data
  },

  async getExpensesByMonth(params = {}) {
    const { data } = await http.get('/api/v1/reports/by-month', { params })
    return data
  },

  async exportCsv(params = {}) {
    const response = await http.get('/api/v1/reports/export/csv', {
      params,
      responseType: 'blob'
    })
    return response
  },

  async exportPdf(params = {}) {
    const response = await http.get('/api/v1/reports/export/pdf', {
      params,
      responseType: 'blob'
    })
    return response
  }
}
