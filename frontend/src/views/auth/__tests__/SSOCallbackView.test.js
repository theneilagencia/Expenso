import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'

const mockSsoLogin = vi.fn()
const mockSetAuth = vi.fn()
const mockRouterPush = vi.fn()
let mockQuery = {}

vi.mock('@/services/auth', () => ({
  authService: {
    ssoLogin: (...args) => mockSsoLogin(...args),
  },
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => ({
    setAuth: (...args) => mockSetAuth(...args),
  }),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ get query() { return mockQuery } }),
  useRouter: () => ({ push: (...args) => mockRouterPush(...args) }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

import SSOCallbackView from '../SSOCallbackView.vue'

describe('SSOCallbackView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQuery = {}
  })

  function mountView() {
    return shallowMount(SSOCallbackView, {
      global: {
        stubs: {
          AuthLayout: { template: '<div><slot /></div>' },
          'router-link': { template: '<a class="stub-router-link"><slot /></a>', props: ['to'] },
        },
      },
    })
  }

  it('should show loading on mount', () => {
    mockQuery = { code: 'auth-code', state: 'google' }
    mockSsoLogin.mockReturnValue(new Promise(() => {}))
    const wrapper = mountView()
    expect(wrapper.text()).toContain('common.loading')
  })

  it('should exchange code and redirect on success', async () => {
    mockQuery = { code: 'auth-code', state: 'google' }
    const authData = { access_token: 'token', user: { id: '1' } }
    mockSsoLogin.mockResolvedValue(authData)

    mountView()
    await flushPromises()

    expect(mockSsoLogin).toHaveBeenCalledWith('google', 'auth-code')
    expect(mockSetAuth).toHaveBeenCalledWith(authData)
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'dashboard' })
  })

  it('should show error when no code in query', async () => {
    mockQuery = {}
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.sso-callback__error').exists()).toBe(true)
    expect(wrapper.find('.sso-callback__error').text()).toBe('auth.ssoFailed')
    expect(mockSsoLogin).not.toHaveBeenCalled()
  })

  it('should show error when no provider in query', async () => {
    mockQuery = { code: 'auth-code' }
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.sso-callback__error').exists()).toBe(true)
    expect(mockSsoLogin).not.toHaveBeenCalled()
  })

  it('should show error on SSO login failure', async () => {
    mockQuery = { code: 'auth-code', state: 'azure_ad' }
    mockSsoLogin.mockRejectedValue(new Error('SSO failed'))

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.sso-callback__error').exists()).toBe(true)
    expect(wrapper.find('.sso-callback__error').text()).toBe('auth.ssoFailed')
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  it('should show back to login link on error', async () => {
    mockQuery = {}
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.sso-callback__link').exists()).toBe(true)
  })
})
