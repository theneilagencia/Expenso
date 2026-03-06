import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useChartData } from '@/composables/useChartData'

vi.mock('@/services/reports', () => ({
  reportsService: {
    getDashboard: vi.fn(),
    getExpensesByCategory: vi.fn(),
    getExpensesByDepartment: vi.fn(),
    getExpensesByMonth: vi.fn(),
  },
}))

import { reportsService } from '@/services/reports'

describe('useChartData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { loading, error, categoryData, monthlyData, departmentData, statusBreakdown } =
      useChartData()

    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(categoryData.value).toEqual([])
    expect(monthlyData.value).toEqual([])
    expect(departmentData.value).toEqual([])
    expect(statusBreakdown.value).toEqual({})
  })

  it('should set loading=true during fetch', async () => {
    let resolvePromise
    reportsService.getDashboard.mockReturnValue(new Promise((r) => { resolvePromise = r }))
    reportsService.getExpensesByCategory.mockResolvedValue([])
    reportsService.getExpensesByDepartment.mockResolvedValue([])
    reportsService.getExpensesByMonth.mockResolvedValue([])

    const { loading, fetchChartData } = useChartData()
    const promise = fetchChartData()

    expect(loading.value).toBe(true)

    resolvePromise({})
    await promise

    expect(loading.value).toBe(false)
  })

  it('should populate all data refs on successful fetch', async () => {
    const mockDash = { status_breakdown: { DRAFT: 3, PAID: 7 } }
    const mockCat = [{ category: 'Travel', total: 5000 }, { category: 'Food', total: 2000 }]
    const mockDept = [{ department: 'Engineering', total: 8000 }]
    const mockMonth = [{ year: 2026, month: 1, total: 3000 }]

    reportsService.getDashboard.mockResolvedValue(mockDash)
    reportsService.getExpensesByCategory.mockResolvedValue(mockCat)
    reportsService.getExpensesByDepartment.mockResolvedValue(mockDept)
    reportsService.getExpensesByMonth.mockResolvedValue(mockMonth)

    const { categoryData, monthlyData, departmentData, statusBreakdown, fetchChartData } =
      useChartData()

    await fetchChartData()

    expect(statusBreakdown.value).toEqual({ DRAFT: 3, PAID: 7 })
    expect(categoryData.value).toEqual(mockCat)
    expect(departmentData.value).toEqual(mockDept)
    expect(monthlyData.value).toEqual(mockMonth)
  })

  it('should handle items wrapper from paginated responses', async () => {
    const catItems = [{ category: 'Office', total: 1200 }]
    const deptItems = [{ department: 'HR', total: 4500 }]
    const monthItems = [{ year: 2026, month: 2, total: 6000 }]

    reportsService.getDashboard.mockResolvedValue({ status_breakdown: {} })
    reportsService.getExpensesByCategory.mockResolvedValue({ items: catItems })
    reportsService.getExpensesByDepartment.mockResolvedValue({ items: deptItems })
    reportsService.getExpensesByMonth.mockResolvedValue({ items: monthItems })

    const { categoryData, departmentData, monthlyData, fetchChartData } = useChartData()

    await fetchChartData()

    expect(categoryData.value).toEqual(catItems)
    expect(departmentData.value).toEqual(deptItems)
    expect(monthlyData.value).toEqual(monthItems)
  })

  it('should set error ref when fetch fails', async () => {
    const networkError = new Error('Network Error')
    reportsService.getDashboard.mockRejectedValue(networkError)
    reportsService.getExpensesByCategory.mockResolvedValue([])
    reportsService.getExpensesByDepartment.mockResolvedValue([])
    reportsService.getExpensesByMonth.mockResolvedValue([])

    const { error, fetchChartData } = useChartData()

    await fetchChartData()

    expect(error.value).toBe(networkError)
    expect(error.value.message).toBe('Network Error')
  })

  it('should set loading=false after error', async () => {
    reportsService.getDashboard.mockRejectedValue(new Error('Server Error'))
    reportsService.getExpensesByCategory.mockResolvedValue([])
    reportsService.getExpensesByDepartment.mockResolvedValue([])
    reportsService.getExpensesByMonth.mockResolvedValue([])

    const { loading, fetchChartData } = useChartData()

    await fetchChartData()

    expect(loading.value).toBe(false)
  })

  it('should pass params through to all service calls', async () => {
    reportsService.getDashboard.mockResolvedValue({})
    reportsService.getExpensesByCategory.mockResolvedValue([])
    reportsService.getExpensesByDepartment.mockResolvedValue([])
    reportsService.getExpensesByMonth.mockResolvedValue([])

    const params = { start_date: '2026-01-01', end_date: '2026-03-01', department_id: 'abc' }
    const { fetchChartData } = useChartData()

    await fetchChartData(params)

    expect(reportsService.getDashboard).toHaveBeenCalledWith(params)
    expect(reportsService.getExpensesByCategory).toHaveBeenCalledWith(params)
    expect(reportsService.getExpensesByDepartment).toHaveBeenCalledWith(params)
    expect(reportsService.getExpensesByMonth).toHaveBeenCalledWith(params)
  })

  it('should default statusBreakdown to {} when dashData has no status_breakdown', async () => {
    reportsService.getDashboard.mockResolvedValue({ total_amount: 10000 })
    reportsService.getExpensesByCategory.mockResolvedValue([])
    reportsService.getExpensesByDepartment.mockResolvedValue([])
    reportsService.getExpensesByMonth.mockResolvedValue([])

    const { statusBreakdown, fetchChartData } = useChartData()

    await fetchChartData()

    expect(statusBreakdown.value).toEqual({})
  })
})
