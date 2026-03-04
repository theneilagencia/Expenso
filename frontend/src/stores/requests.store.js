import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRequestsStore = defineStore('requests', () => {
  const requests = ref([])
  const currentRequest = ref(null)
  const pagination = ref({ page: 1, perPage: 20, total: 0 })
  const filters = ref({})

  function setRequests(data, meta) {
    requests.value = data
    if (meta) pagination.value = meta
  }

  function setCurrentRequest(data) {
    currentRequest.value = data
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function resetFilters() {
    filters.value = {}
    pagination.value.page = 1
  }

  return { requests, currentRequest, pagination, filters, setRequests, setCurrentRequest, setFilters, resetFilters }
})
