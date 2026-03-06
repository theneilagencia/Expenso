import http from '@/services/http'

export const paymentsService = {
  async list(params = {}) {
    const { data } = await http.get('/api/v1/payments', { params })
    return data
  },

  async process(requestId, payload) {
    const { data } = await http.post(`/api/v1/payments/${requestId}`, payload)
    return data
  },

  async retry(paymentId) {
    const { data } = await http.post(`/api/v1/payments/${paymentId}/retry`)
    return data
  },

  async batchProcess(payload) {
    const { data } = await http.post('/api/v1/payments/batch', payload)
    return data
  },

  async getStatus(paymentId) {
    const { data } = await http.get(`/api/v1/payments/${paymentId}/status`)
    return data
  },

  async exportXlsx(params = {}) {
    const response = await http.get('/api/v1/payments/export/xlsx', {
      params,
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'payments_export.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }
}
