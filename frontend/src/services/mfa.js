import http from '@/services/http'

export const mfaService = {
  async setup() {
    const { data } = await http.post('/api/v1/auth/mfa/setup')
    return data
  },

  async confirm(code) {
    const { data } = await http.post('/api/v1/auth/mfa/confirm', { code })
    return data
  },

  async verify(mfaToken, code) {
    const { data } = await http.post('/api/v1/auth/mfa/verify', { mfa_token: mfaToken, code })
    return data
  },

  async disable(currentPassword) {
    const { data } = await http.delete('/api/v1/auth/mfa', { data: { current_password: currentPassword } })
    return data
  }
}
