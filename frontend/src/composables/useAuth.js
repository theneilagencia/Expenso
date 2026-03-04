import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import http from '@/services/http'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  async function login(email, password) {
    const { data } = await http.post('/api/v1/auth/login', { email, password })
    authStore.setAuth(data)
    return data
  }

  async function logout() {
    try {
      await http.post('/api/v1/auth/logout')
    } finally {
      authStore.clearAuth()
      router.push({ name: 'login' })
    }
  }

  async function fetchMe() {
    const { data } = await http.get('/api/v1/users/me')
    authStore.updateUser(data)
    return data
  }

  return { login, logout, fetchMe }
}
