import { ref } from 'vue'
import { approvalsService } from '@/services/approvals'

export function useApproval() {
  const loading = ref(false)
  const pendingApprovals = ref([])
  const error = ref(null)

  async function fetchPendingApprovals(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await approvalsService.list(params)
      pendingApprovals.value = data.items || data
      return data
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function approve(requestId, comment = '') {
    loading.value = true
    error.value = null
    try {
      return await approvalsService.approve(requestId, { comment })
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function reject(requestId, comment) {
    loading.value = true
    error.value = null
    try {
      return await approvalsService.reject(requestId, { comment })
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  async function requestEdit(requestId, comment) {
    loading.value = true
    error.value = null
    try {
      return await approvalsService.requestEdit(requestId, { comment })
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    pendingApprovals,
    fetchPendingApprovals,
    approve,
    reject,
    requestEdit
  }
}
