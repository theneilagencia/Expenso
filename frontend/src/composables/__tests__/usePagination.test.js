import { describe, it, expect, vi } from 'vitest'
import { usePagination } from '../usePagination'

describe('usePagination', () => {
  function setup(fetchFn, opts) {
    return usePagination(fetchFn || vi.fn(), opts)
  }

  it('should have initial page of 1', () => {
    const { page } = setup()
    expect(page.value).toBe(1)
  })

  it('should default itemsPerPage to 20', () => {
    const { itemsPerPage } = setup()
    expect(itemsPerPage.value).toBe(20)
  })

  it('should accept custom perPage option', () => {
    const { itemsPerPage } = setup(vi.fn(), { perPage: 10 })
    expect(itemsPerPage.value).toBe(10)
  })

  it('should have initial total of 0', () => {
    const { total } = setup()
    expect(total.value).toBe(0)
  })

  it('should calculate totalPages from total and itemsPerPage', () => {
    const { totalPages, setTotal } = setup(vi.fn(), { perPage: 10 })
    setTotal(45)
    expect(totalPages.value).toBe(5) // ceil(45/10)
  })

  it('should calculate totalPages as 0 when total is 0', () => {
    const { totalPages } = setup()
    expect(totalPages.value).toBe(0)
  })

  it('should report hasNext as false when there are no pages', () => {
    const { hasNext } = setup()
    expect(hasNext.value).toBe(false)
  })

  it('should report hasNext as true when more pages exist', () => {
    const { hasNext, setTotal } = setup(vi.fn(), { perPage: 10 })
    setTotal(30) // 3 pages, currently on page 1
    expect(hasNext.value).toBe(true)
  })

  it('should report hasPrev as false on page 1', () => {
    const { hasPrev } = setup()
    expect(hasPrev.value).toBe(false)
  })

  it('should report hasPrev as true when page > 1', () => {
    const fetchFn = vi.fn()
    const { hasPrev, setTotal, goToPage } = setup(fetchFn, { perPage: 10 })
    setTotal(30)
    goToPage(2)
    expect(hasPrev.value).toBe(true)
  })

  it('should increment page on nextPage', async () => {
    const fetchFn = vi.fn()
    const { page, setTotal, nextPage } = setup(fetchFn, { perPage: 10 })
    setTotal(30) // 3 pages
    await nextPage()
    expect(page.value).toBe(2)
  })

  it('should not increment page on nextPage when on last page', async () => {
    const fetchFn = vi.fn()
    const { page, setTotal, goToPage, nextPage } = setup(fetchFn, { perPage: 10 })
    setTotal(30)
    await goToPage(3) // go to last page
    fetchFn.mockClear()
    await nextPage()
    expect(page.value).toBe(3) // unchanged
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('should decrement page on prevPage', async () => {
    const fetchFn = vi.fn()
    const { page, setTotal, goToPage, prevPage } = setup(fetchFn, { perPage: 10 })
    setTotal(30)
    await goToPage(3)
    await prevPage()
    expect(page.value).toBe(2)
  })

  it('should not decrement page on prevPage when on page 1', async () => {
    const fetchFn = vi.fn()
    const { page, prevPage } = setup(fetchFn)
    fetchFn.mockClear()
    await prevPage()
    expect(page.value).toBe(1) // unchanged
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('should call fetchFn with page and per_page on goToPage', async () => {
    const fetchFn = vi.fn()
    const { goToPage } = setup(fetchFn, { perPage: 15 })
    await goToPage(3)
    expect(fetchFn).toHaveBeenCalledWith({ page: 3, per_page: 15 })
  })

  it('should call fetchFn on nextPage', async () => {
    const fetchFn = vi.fn()
    const { setTotal, nextPage } = setup(fetchFn, { perPage: 10 })
    setTotal(20)
    await nextPage()
    expect(fetchFn).toHaveBeenCalledWith({ page: 2, per_page: 10 })
  })

  it('should call fetchFn on prevPage', async () => {
    const fetchFn = vi.fn()
    const { setTotal, goToPage, prevPage } = setup(fetchFn, { perPage: 10 })
    setTotal(30)
    await goToPage(3)
    fetchFn.mockClear()
    await prevPage()
    expect(fetchFn).toHaveBeenCalledWith({ page: 2, per_page: 10 })
  })

  it('should update total via setTotal', () => {
    const { total, setTotal } = setup()
    expect(total.value).toBe(0)
    setTotal(100)
    expect(total.value).toBe(100)
  })
})
