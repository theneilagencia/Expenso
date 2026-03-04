import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { router } from '@/router'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

http.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      try {
        const { data } = await axios.post(
          `${http.defaults.baseURL}/api/v1/auth/refresh`,
          { refresh_token: authStore.refreshToken }
        )
        authStore.setAuth(data)
        error.config.headers.Authorization = `Bearer ${data.access_token}`
        return http(error.config)
      } catch {
        authStore.clearAuth()
        router.push({ name: 'login' })
      }
    }
    return Promise.reject(error)
  }
)

export default http
