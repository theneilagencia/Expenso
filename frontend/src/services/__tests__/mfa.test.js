import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/http', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

import { mfaService } from '../mfa'
import http from '@/services/http'

describe('mfaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('setup', () => {
    it('should POST to /api/v1/auth/mfa/setup', async () => {
      http.post.mockResolvedValue({ data: { qr_data_uri: 'data:image/png;base64,...', secret: 'ABC123' } })
      const result = await mfaService.setup()
      expect(http.post).toHaveBeenCalledWith('/api/v1/auth/mfa/setup')
      expect(result).toEqual({ qr_data_uri: 'data:image/png;base64,...', secret: 'ABC123' })
    })
  })

  describe('confirm', () => {
    it('should POST to /api/v1/auth/mfa/confirm with code', async () => {
      http.post.mockResolvedValue({ data: { message: 'MFA enabled' } })
      const result = await mfaService.confirm('123456')
      expect(http.post).toHaveBeenCalledWith('/api/v1/auth/mfa/confirm', { code: '123456' })
      expect(result).toEqual({ message: 'MFA enabled' })
    })
  })

  describe('verify', () => {
    it('should POST to /api/v1/auth/mfa/verify with mfa_token and code', async () => {
      http.post.mockResolvedValue({ data: { access_token: 'tok', refresh_token: 'ref' } })
      const result = await mfaService.verify('mfa-token-123', '654321')
      expect(http.post).toHaveBeenCalledWith('/api/v1/auth/mfa/verify', {
        mfa_token: 'mfa-token-123',
        code: '654321',
      })
      expect(result).toEqual({ access_token: 'tok', refresh_token: 'ref' })
    })
  })

  describe('disable', () => {
    it('should DELETE /api/v1/auth/mfa with current_password', async () => {
      http.delete.mockResolvedValue({ data: { message: 'MFA disabled' } })
      const result = await mfaService.disable('mypassword')
      expect(http.delete).toHaveBeenCalledWith('/api/v1/auth/mfa', {
        data: { current_password: 'mypassword' },
      })
      expect(result).toEqual({ message: 'MFA disabled' })
    })
  })

  describe('error handling', () => {
    it('should propagate errors from setup', async () => {
      http.post.mockRejectedValue(new Error('Network error'))
      await expect(mfaService.setup()).rejects.toThrow('Network error')
    })

    it('should propagate errors from verify', async () => {
      http.post.mockRejectedValue(new Error('Invalid code'))
      await expect(mfaService.verify('token', '000000')).rejects.toThrow('Invalid code')
    })
  })
})
