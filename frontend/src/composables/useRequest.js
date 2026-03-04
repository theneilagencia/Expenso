import { ref } from 'vue'
import { useRequestsStore } from '@/stores/requests.store'
import { requestsService } from '@/services/requests'

export function useRequest() {
  const store = useRequestsStore()
  const loading = ref(false)
  const error = ref(null)

  async function fetchRequests(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await requestsService.list({ ...store.filters, ...params })
      store.setRequests(data.items, data.meta)
      return data
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchRequest(id) {
    loading.value = true
    error.value = null
    try {
      const data = await requestsService.getById(id)
      store.setCurrentRequest(data)
      return data
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createRequest(payload) {
    loading.value = true
    error.value = null
    try {
      return await requestsService.create(payload)
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateRequest(id, payload) {
    loading.value = true
    error.value = null
    try {
      const data = await requestsService.update(id, payload)
      store.setCurrentRequest(data)
      return data
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function performAction(id, action, payload = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await requestsService[action](id, payload)
      store.setCurrentRequest(data)
      return data
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAuditLog(id) {
    return await requestsService.getAuditLog(id)
  }

  async function fetchVersions(id) {
    return await requestsService.getVersions(id)
  }

  return {
    loading,
    error,
    requests: store.requests,
    currentRequest: store.currentRequest,
    pagination: store.pagination,
    filters: store.filters,
    fetchRequests,
    fetchRequest,
    createRequest,
    updateRequest,
    performAction,
    fetchAuditLog,
    fetchVersions,
    setFilters: store.setFilters,
    resetFilters: store.resetFilters
  }
}
