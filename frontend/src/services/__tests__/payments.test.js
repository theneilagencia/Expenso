import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/http', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import { paymentsService } from '../payments'
import http from '@/services/http'

describe('paymentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should GET /api/v1/payments with params', async () => {
      http.get.mockResolvedValue({ data: { items: [], meta: {} } })
      const result = await paymentsService.list({ status: 'PENDING' })
      expect(http.get).toHaveBeenCalledWith('/api/v1/payments', {
        params: { status: 'PENDING' },
      })
      expect(result).toEqual({ items: [], meta: {} })
    })

    it('should GET /api/v1/payments with default empty params', async () => {
      http.get.mockResolvedValue({ data: [] })
      await paymentsService.list()
      expect(http.get).toHaveBeenCalledWith('/api/v1/payments', { params: {} })
    })
  })

  describe('process', () => {
    it('should POST /api/v1/payments/:requestId with payload', async () => {
      const payload = { method: 'PIX' }
      http.post.mockResolvedValue({ data: { id: 'pay-1', status: 'PROCESSING' } })
      const result = await paymentsService.process('req-123', payload)
      expect(http.post).toHaveBeenCalledWith('/api/v1/payments/req-123', payload)
      expect(result.status).toBe('PROCESSING')
    })
  })

  describe('retry', () => {
    it('should POST /api/v1/payments/:paymentId/retry', async () => {
      http.post.mockResolvedValue({ data: { id: 'pay-1', status: 'PROCESSING' } })
      const result = await paymentsService.retry('pay-1')
      expect(http.post).toHaveBeenCalledWith('/api/v1/payments/pay-1/retry')
      expect(result.id).toBe('pay-1')
    })
  })

  describe('batchProcess', () => {
    it('should POST /api/v1/payments/batch with payload', async () => {
      const payload = { request_ids: ['r1', 'r2'], method: 'REVOLUT' }
      http.post.mockResolvedValue({ data: { processed: 2, failed: 0 } })
      const result = await paymentsService.batchProcess(payload)
      expect(http.post).toHaveBeenCalledWith('/api/v1/payments/batch', payload)
      expect(result.processed).toBe(2)
    })
  })

  describe('getStatus', () => {
    it('should GET /api/v1/payments/:paymentId/status', async () => {
      http.get.mockResolvedValue({ data: { id: 'pay-1', status: 'PAID' } })
      const result = await paymentsService.getStatus('pay-1')
      expect(http.get).toHaveBeenCalledWith('/api/v1/payments/pay-1/status')
      expect(result.status).toBe('PAID')
    })
  })

  describe('exportXlsx', () => {
    it('should GET /api/v1/payments/export/xlsx with blob responseType', async () => {
      const mockBlob = new Blob(['xlsx-data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      http.get.mockResolvedValue({ data: mockBlob })

      const createObjectURLMock = vi.fn(() => 'blob:http://localhost/fake-url')
      const revokeObjectURLMock = vi.fn()
      window.URL.createObjectURL = createObjectURLMock
      window.URL.revokeObjectURL = revokeObjectURLMock

      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      const clickSpy = vi.fn()
      const removeSpy = vi.fn()
      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        setAttribute: vi.fn(),
        click: clickSpy,
        remove: removeSpy,
      })

      await paymentsService.exportXlsx({ status: 'PAID' })

      expect(http.get).toHaveBeenCalledWith('/api/v1/payments/export/xlsx', {
        params: { status: 'PAID' },
        responseType: 'blob',
      })
      expect(createObjectURLMock).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
      expect(removeSpy).toHaveBeenCalled()
      expect(revokeObjectURLMock).toHaveBeenCalled()

      appendChildSpy.mockRestore()
    })

    it('should use default empty params for exportXlsx', async () => {
      const mockBlob = new Blob(['data'])
      http.get.mockResolvedValue({ data: mockBlob })

      window.URL.createObjectURL = vi.fn(() => 'blob:url')
      window.URL.revokeObjectURL = vi.fn()
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        setAttribute: vi.fn(),
        click: vi.fn(),
        remove: vi.fn(),
      })

      await paymentsService.exportXlsx()

      expect(http.get).toHaveBeenCalledWith('/api/v1/payments/export/xlsx', {
        params: {},
        responseType: 'blob',
      })
    })
  })
})
