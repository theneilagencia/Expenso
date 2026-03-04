import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])

  const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length)

  function setNotifications(data) {
    notifications.value = data
  }

  function markAsRead(id) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) notification.is_read = true
  }

  function markAllAsRead() {
    notifications.value.forEach(n => { n.is_read = true })
  }

  return { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead }
})
