import { ref, computed } from 'vue'

export function useSLA(request) {
  const now = ref(new Date())

  const slaDeadline = computed(() => {
    if (!request.value?.sla_deadline) return null
    return new Date(request.value.sla_deadline)
  })

  const hoursRemaining = computed(() => {
    if (!slaDeadline.value) return null
    const diff = slaDeadline.value - now.value
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)))
  })

  const isOverdue = computed(() => {
    if (!slaDeadline.value) return false
    return now.value > slaDeadline.value
  })

  const isWarning = computed(() => {
    if (!hoursRemaining.value) return false
    return hoursRemaining.value <= 4 && !isOverdue.value
  })

  const slaStatus = computed(() => {
    if (isOverdue.value) return 'overdue'
    if (isWarning.value) return 'warning'
    return 'ok'
  })

  return { slaDeadline, hoursRemaining, isOverdue, isWarning, slaStatus }
}
