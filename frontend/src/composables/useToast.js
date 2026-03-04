import { ref } from 'vue'

const toasts = ref([])
let idCounter = 0

export function useToast() {
  function show({ message, type = 'info', duration = 4000 }) {
    const id = ++idCounter
    toasts.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  function success(message) {
    return show({ message, type: 'success' })
  }

  function error(message) {
    return show({ message, type: 'error', duration: 6000 })
  }

  function warning(message) {
    return show({ message, type: 'warning' })
  }

  function info(message) {
    return show({ message, type: 'info' })
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, show, success, error, warning, info, dismiss }
}
