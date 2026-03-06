import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRequestsStore } from '../requests.store'

describe('requests.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('should have an empty requests array', () => {
      const store = useRequestsStore()
      expect(store.requests).toEqual([])
    })

    it('should have null currentRequest', () => {
      const store = useRequestsStore()
      expect(store.currentRequest).toBeNull()
    })

    it('should have default pagination values', () => {
      const store = useRequestsStore()
      expect(store.pagination).toEqual({ page: 1, perPage: 20, total: 0 })
    })

    it('should have empty filters', () => {
      const store = useRequestsStore()
      expect(store.filters).toEqual({})
    })
  })

  describe('setRequests', () => {
    it('should set the requests list', () => {
      const store = useRequestsStore()
      const data = [
        { id: '1', title: 'Travel', status: 'DRAFT' },
        { id: '2', title: 'Software', status: 'PENDING_AI' },
      ]
      store.setRequests(data)
      expect(store.requests).toHaveLength(2)
      expect(store.requests[0].title).toBe('Travel')
    })

    it('should update pagination when meta is provided', () => {
      const store = useRequestsStore()
      const meta = { page: 2, perPage: 10, total: 50 }
      store.setRequests([], meta)
      expect(store.pagination).toEqual(meta)
    })

    it('should keep default pagination when meta is not provided', () => {
      const store = useRequestsStore()
      store.setRequests([{ id: '1' }])
      expect(store.pagination).toEqual({ page: 1, perPage: 20, total: 0 })
    })
  })

  describe('setCurrentRequest', () => {
    it('should set the current request', () => {
      const store = useRequestsStore()
      const request = { id: '123', title: 'Conference', amount: 5000 }
      store.setCurrentRequest(request)
      expect(store.currentRequest).toEqual(request)
    })

    it('should allow clearing currentRequest with null', () => {
      const store = useRequestsStore()
      store.setCurrentRequest({ id: '1' })
      store.setCurrentRequest(null)
      expect(store.currentRequest).toBeNull()
    })
  })

  describe('setFilters', () => {
    it('should merge new filters into existing filters', () => {
      const store = useRequestsStore()
      store.setFilters({ status: 'DRAFT' })
      store.setFilters({ category: 'Travel' })
      expect(store.filters).toEqual({ status: 'DRAFT', category: 'Travel' })
    })

    it('should overwrite existing filter keys', () => {
      const store = useRequestsStore()
      store.setFilters({ status: 'DRAFT' })
      store.setFilters({ status: 'PENDING_AI' })
      expect(store.filters.status).toBe('PENDING_AI')
    })
  })

  describe('resetFilters', () => {
    it('should reset filters to empty object', () => {
      const store = useRequestsStore()
      store.setFilters({ status: 'DRAFT', category: 'Travel' })
      store.resetFilters()
      expect(store.filters).toEqual({})
    })

    it('should reset pagination page to 1', () => {
      const store = useRequestsStore()
      store.setRequests([], { page: 5, perPage: 20, total: 100 })
      store.resetFilters()
      expect(store.pagination.page).toBe(1)
    })
  })
})
