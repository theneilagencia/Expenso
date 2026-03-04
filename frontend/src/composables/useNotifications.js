import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications.store'
import { notificationsService } from '@/services/notifications'

export function useNotifications() {
  const store = useNotificationsStore()
  const loading = ref(false)
  let pollInterval = null

  async function fetchNotifications() {
    loading.value = true
    try {
      const data = await notificationsService.list()
      store.setNotifications(data.items || data)
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id) {
    await notificationsService.markAsRead(id)
    store.markAsRead(id)
  }

  async function markAllAsRead() {
    await notificationsService.markAllAsRead()
    store.markAllAsRead()
  }

  function startPolling(intervalMs = 30000) {
    fetchNotifications()
    pollInterval = setInterval(fetchNotifications, intervalMs)
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  onMounted(() => startPolling())
  onUnmounted(() => stopPolling())

  return {
    loading,
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}
