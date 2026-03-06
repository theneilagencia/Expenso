import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ROLE_HIERARCHY } from '@/constants/roles'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('expenso_token') || null)
  const refreshToken = ref(localStorage.getItem('expenso_refresh_token') || null)

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)
  const userLocale = computed(() => user.value?.locale || 'en-US')
  const forcePasswordReset = computed(() => user.value?.force_password_reset || false)

  function hasMinRole(minRole) {
    const userLevel = ROLE_HIERARCHY[userRole.value] || 0
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0
    return userLevel >= requiredLevel
  }

  function hasRole(...roles) {
    return roles.includes(userRole.value)
  }

  function setAuth(data) {
    user.value = data.user
    token.value = data.access_token
    refreshToken.value = data.refresh_token
    localStorage.setItem('expenso_token', data.access_token)
    localStorage.setItem('expenso_refresh_token', data.refresh_token)
  }

  function clearAuth() {
    user.value = null
    token.value = null
    refreshToken.value = null
    localStorage.removeItem('expenso_token')
    localStorage.removeItem('expenso_refresh_token')
  }

  function updateUser(data) {
    user.value = { ...user.value, ...data }
  }

  return {
    user, token, refreshToken,
    isAuthenticated, userRole, userLocale, forcePasswordReset,
    hasMinRole, hasRole,
    setAuth, clearAuth, updateUser,
  }
})
