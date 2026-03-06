import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
  },
}))

import { reportsService } from '../reports'
import http from '@/services/http'

describe('reportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDashboard', () => {
    it('should GET /api/v1/reports/dashboard with params', async () => {
      http.get.mockResolvedValue({ data: { total_expenses: 50000, pending: 10 } })
      const result = await reportsService.getDashboard({ period: '30d' })
      expect(http.get).toHaveBeenCalledWith('/api/v1/reports/dashboard', {
        params: { period: '30d' },
      })
      expect(result.total_expenses).toBe(50000)
    })

    it('should use default empty params', async () => {
      http.get.mockResolvedValue({ data: {} })
      await reportsService.getDashboard()
      expect(http.get).toHaveBeenCalledWith('/api/v1/reports/dashboard', { params: {} })
    })
  })

  describe('getExpensesByCategory', () => {
    it('should GET /api/v1/reports/by-category with params', async () => {
      http.get.mockResolvedValue({ data: [{ category: 'Travel', total: 10000 }] })
      const result = await reportsService.getExpensesByCategory({ period: '90d' })
      expect(http.get).toHaveBeenCalledWith('/api/v1/reports/by-category', {
        params: { period: '90d' },
      })
      expect(result[0].category).toBe('Travel')
    })
  })

  describe('getExpensesByDepartment', () => {
    it('should GET /api/v1/reports/by-department with params', async () => {
      http.get.mockResolvedValue({ data: [{ department: 'Engineering', total: 25000 }] })
      const result = await reportsService.getExpensesByDepartment({ year: 2026 })
      expect(http.get).toHaveBeenCalledWith('/api/v1/reports/by-department', {
        params: { year: 2026 },
      })
      expect(result[0].department).toBe('Engineering')
    })
  })

  describe('getExpensesByMonth', () => {
    it('should GET /api/v1/reports/by-month with params', async () => {
      http.get.mockResolvedValue({ data: [{ month: '2026-01', total: 15000 }] })
      const result = await reportsService.getExpensesByMonth({ year: 2026 })
      expect(http.get).toHaveBeenCalledWith('/api/v1/reports/by-month', {
        params: { year: 2026 },
      })
      expect(result[0].month).toBe('2026-01')
    })

    it('should use default empty params', async () => {
      http.get.mockResolvedValue({ data: [] })
      await reportsService.getExpensesByMonth()
      expect(http.get).toHaveBeenCalledWith('/api/v1/reports/by-month', { params: {} })
    })
  })

  describe('exportCsv', () => {
    it('should GET /api/v1/reports/export/csv with blob responseType', async () => {
      const mockResponse = { data: new Blob(['csv-data']) }
      http.get.mockResolvedValue(mockResponse)
      const result = await reportsService.exportCsv({ period: '30d' })
      expect(http.get).toHaveBeenCalledWith('/api/v1/reports/export/csv', {
        params: { period: '30d' },
        responseType: 'blob',
      })
      expect(result).toBe(mockResponse)
    })

    it('should use default empty params for exportCsv', async () => {
      http.get.mockResolvedValue({ data: new Blob() })
      await reportsService.exportCsv()
      expect(http.get).toHaveBeenCalledWith('/api/v1/reports/export/csv', {
        params: {},
        responseType: 'blob',
      })
    })
  })

  describe('exportPdf', () => {
    it('should GET /api/v1/reports/export/pdf with blob responseType', async () => {
      const mockResponse = { data: new Blob(['pdf-data']) }
      http.get.mockResolvedValue(mockResponse)
      const result = await reportsService.exportPdf({ department: 'Engineering' })
      expect(http.get).toHaveBeenCalledWith('/api/v1/reports/export/pdf', {
        params: { department: 'Engineering' },
        responseType: 'blob',
      })
      expect(result).toBe(mockResponse)
    })
  })
})
