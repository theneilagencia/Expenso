import http from '@/services/http'

export const authService = {
  async login(email, password) {
    const { data } = await http.post('/api/v1/auth/login', { email, password })
    return data
  },

  async refresh(refreshToken) {
    const { data } = await http.post('/api/v1/auth/refresh', { refresh_token: refreshToken })
    return data
  },

  async logout() {
    const { data } = await http.post('/api/v1/auth/logout')
    return data
  },

  async getMe() {
    const { data } = await http.get('/api/v1/users/me')
    return data
  },

  async updateMe(payload) {
    const { data } = await http.patch('/api/v1/users/me', payload)
    return data
  },

  async requestPasswordReset(email) {
    const { data } = await http.post('/api/v1/auth/password-reset/request', { email })
    return data
  },

  async confirmPasswordReset(token, newPassword) {
    const { data } = await http.post('/api/v1/auth/password-reset/confirm', {
      token,
      new_password: newPassword,
    })
    return data
  },

  async changePassword(currentPassword, newPassword) {
    const { data } = await http.post('/api/v1/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return data
  },

  async getSSOConfig() {
    const { data } = await http.get('/api/v1/auth/sso/config')
    return data
  },

  async ssoLogin(provider, code) {
    const { data } = await http.post('/api/v1/auth/sso/login', {
      provider,
      code,
      redirect_uri: `${window.location.origin}/auth/callback`,
    })
    return data
  },
}
