import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useFilters } from '../useFilters'

describe('useFilters', () => {
  let fetchFn

  beforeEach(() => {
    fetchFn = vi.fn()
  })

  it('should initialize filters with default values', () => {
    const defaults = { status: 'all', search: '' }
    const { filters } = useFilters(fetchFn, defaults)
    expect(filters.value).toEqual({ status: 'all', search: '' })
  })

  it('should initialize filters as empty object when no defaults provided', () => {
    const { filters } = useFilters(fetchFn)
    expect(filters.value).toEqual({})
  })

  it('should not mutate the original defaults object', () => {
    const defaults = { status: 'active' }
    const { setFilter } = useFilters(fetchFn, defaults)
    setFilter('status', 'inactive')
    expect(defaults.status).toBe('active')
  })

  it('should update a single filter value with setFilter', () => {
    const { filters, setFilter } = useFilters(fetchFn, { status: 'all', search: '' })
    setFilter('status', 'pending')
    expect(filters.value.status).toBe('pending')
  })

  it('should add a new filter key with setFilter', () => {
    const { filters, setFilter } = useFilters(fetchFn, {})
    setFilter('category', 'travel')
    expect(filters.value.category).toBe('travel')
  })

  it('should reset all filters to default values', () => {
    const defaults = { status: 'all', search: '' }
    const { filters, setFilter, resetFilters } = useFilters(fetchFn, defaults)
    setFilter('status', 'pending')
    setFilter('search', 'test query')
    resetFilters()
    expect(filters.value).toEqual({ status: 'all', search: '' })
  })

  it('should call fetchFn via applyFilters', () => {
    const defaults = { status: 'active' }
    const { applyFilters } = useFilters(fetchFn, defaults)
    applyFilters()
    expect(fetchFn).toHaveBeenCalledWith({ status: 'active' })
  })

  it('should call fetchFn when filters change via watcher', async () => {
    const { setFilter } = useFilters(fetchFn, { status: 'all' })
    fetchFn.mockClear()
    setFilter('status', 'pending')
    await nextTick()
    expect(fetchFn).toHaveBeenCalledWith({ status: 'pending' })
  })

  it('should call fetchFn when resetFilters is called via watcher', async () => {
    const defaults = { status: 'all' }
    const { setFilter, resetFilters } = useFilters(fetchFn, defaults)
    setFilter('status', 'pending')
    await nextTick()
    fetchFn.mockClear()
    resetFilters()
    await nextTick()
    expect(fetchFn).toHaveBeenCalledWith({ status: 'all' })
  })

  it('should pass the current filter state to fetchFn', () => {
    const defaults = { status: 'all', category: 'food' }
    const { setFilter, applyFilters } = useFilters(fetchFn, defaults)
    setFilter('status', 'approved')
    setFilter('category', 'transport')
    applyFilters()
    expect(fetchFn).toHaveBeenCalledWith({ status: 'approved', category: 'transport' })
  })
})
