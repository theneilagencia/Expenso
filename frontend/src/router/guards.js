import { useAuthStore } from '@/stores/auth.store'

export const requireRole = (roles) => {
  return (to, from, next) => {
    const authStore = useAuthStore()
    if (roles.includes(authStore.user?.role)) {
      next()
    } else {
      next({ name: 'dashboard' })
    }
  }
}
