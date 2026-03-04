import { ref, computed } from 'vue'

export function usePagination(fetchFn, { perPage = 20 } = {}) {
  const page = ref(1)
  const total = ref(0)
  const itemsPerPage = ref(perPage)

  const totalPages = computed(() => Math.ceil(total.value / itemsPerPage.value))
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

  async function goToPage(newPage) {
    page.value = newPage
    return fetchFn({ page: page.value, per_page: itemsPerPage.value })
  }

  async function nextPage() {
    if (hasNext.value) return goToPage(page.value + 1)
  }

  async function prevPage() {
    if (hasPrev.value) return goToPage(page.value - 1)
  }

  function setTotal(newTotal) {
    total.value = newTotal
  }

  return {
    page,
    total,
    itemsPerPage,
    totalPages,
    hasNext,
    hasPrev,
    goToPage,
    nextPage,
    prevPage,
    setTotal
  }
}
