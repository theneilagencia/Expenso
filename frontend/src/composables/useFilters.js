import { ref, watch } from 'vue'

export function useFilters(fetchFn, defaultFilters = {}) {
  const filters = ref({ ...defaultFilters })

  function setFilter(key, value) {
    filters.value[key] = value
  }

  function resetFilters() {
    filters.value = { ...defaultFilters }
  }

  function applyFilters() {
    return fetchFn(filters.value)
  }

  watch(filters, () => {
    applyFilters()
  }, { deep: true })

  return { filters, setFilter, resetFilters, applyFilters }
}
