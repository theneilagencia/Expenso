import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/http', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

import { requestsService } from '../requests'
import http from '@/services/http'

describe('requestsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should GET /api/v1/requests with params', async () => {
      http.get.mockResolvedValue({ data: { items: [], meta: {} } })
      await requestsService.list({ status: 'DRAFT', page: 1 })
      expect(http.get).toHaveBeenCalledWith('/api/v1/requests', {
        params: { status: 'DRAFT', page: 1 },
      })
    })
  })

  describe('getById', () => {
    it('should GET /api/v1/requests/:id', async () => {
      http.get.mockResolvedValue({ data: { id: '123' } })
      const result = await requestsService.getById('123')
      expect(http.get).toHaveBeenCalledWith('/api/v1/requests/123')
      expect(result).toEqual({ id: '123' })
    })
  })

  describe('create', () => {
    it('should POST /api/v1/requests', async () => {
      const payload = { title: 'Test', amount: 100 }
      http.post.mockResolvedValue({ data: { id: 'new-id', ...payload } })
      const result = await requestsService.create(payload)
      expect(http.post).toHaveBeenCalledWith('/api/v1/requests', payload)
      expect(result.title).toBe('Test')
    })
  })

  describe('update', () => {
    it('should PATCH /api/v1/requests/:id', async () => {
      http.patch.mockResolvedValue({ data: { id: '123', title: 'Updated' } })
      const result = await requestsService.update('123', { title: 'Updated' })
      expect(http.patch).toHaveBeenCalledWith('/api/v1/requests/123', { title: 'Updated' })
      expect(result.title).toBe('Updated')
    })
  })

  describe('submit', () => {
    it('should POST /api/v1/requests/:id/submit', async () => {
      http.post.mockResolvedValue({ data: { status: 'PENDING_AI' } })
      const result = await requestsService.submit('123')
      expect(http.post).toHaveBeenCalledWith('/api/v1/requests/123/submit')
      expect(result.status).toBe('PENDING_AI')
    })
  })

  describe('approve', () => {
    it('should POST /api/v1/requests/:id/approve', async () => {
      http.post.mockResolvedValue({ data: { status: 'PENDING_FINANCE' } })
      await requestsService.approve('123', { justification: 'ok' })
      expect(http.post).toHaveBeenCalledWith('/api/v1/requests/123/approve', { justification: 'ok' })
    })
  })

  describe('reject', () => {
    it('should POST /api/v1/requests/:id/reject', async () => {
      http.post.mockResolvedValue({ data: { status: 'REJECTED' } })
      await requestsService.reject('123', { justification: 'bad' })
      expect(http.post).toHaveBeenCalledWith('/api/v1/requests/123/reject', { justification: 'bad' })
    })
  })

  describe('requestEdit', () => {
    it('should POST /api/v1/requests/:id/request-edit', async () => {
      http.post.mockResolvedValue({ data: { status: 'IN_CORRECTION' } })
      await requestsService.requestEdit('123', { comment: 'fix' })
      expect(http.post).toHaveBeenCalledWith('/api/v1/requests/123/request-edit', { comment: 'fix' })
    })
  })

  describe('cancel', () => {
    it('should POST /api/v1/requests/:id/cancel', async () => {
      http.post.mockResolvedValue({ data: { status: 'CANCELLED' } })
      await requestsService.cancel('123')
      expect(http.post).toHaveBeenCalledWith('/api/v1/requests/123/cancel')
    })
  })

  describe('getAuditLog', () => {
    it('should GET /api/v1/requests/:id/audit-log', async () => {
      http.get.mockResolvedValue({ data: [{ action: 'submit' }] })
      const result = await requestsService.getAuditLog('123')
      expect(http.get).toHaveBeenCalledWith('/api/v1/requests/123/audit-log')
      expect(result).toHaveLength(1)
    })
  })

  describe('getVersions', () => {
    it('should GET /api/v1/requests/:id/versions', async () => {
      http.get.mockResolvedValue({ data: [{ version_number: 1 }] })
      const result = await requestsService.getVersions('123')
      expect(http.get).toHaveBeenCalledWith('/api/v1/requests/123/versions')
      expect(result).toHaveLength(1)
    })
  })

  describe('listCategories', () => {
    it('should GET /api/v1/requests/options/categories', async () => {
      http.get.mockResolvedValue({ data: [{ id: '1', name: 'Travel' }] })
      const result = await requestsService.listCategories()
      expect(http.get).toHaveBeenCalledWith('/api/v1/requests/options/categories')
      expect(result[0].name).toBe('Travel')
    })
  })

  describe('listCostCenters', () => {
    it('should GET /api/v1/requests/options/cost-centers', async () => {
      http.get.mockResolvedValue({ data: [{ id: '1', name: 'Eng', code: 'ENG' }] })
      const result = await requestsService.listCostCenters()
      expect(http.get).toHaveBeenCalledWith('/api/v1/requests/options/cost-centers')
      expect(result[0].code).toBe('ENG')
    })
  })
})
