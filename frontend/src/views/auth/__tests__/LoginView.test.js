import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'

const mockLogin = vi.fn()
const mockRouterPush = vi.fn()
const mockGetSSOConfig = vi.fn()

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ login: (...args) => mockLogin(...args) }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: (...args) => mockRouterPush(...args) }),
  createRouter: () => ({
    beforeEach: vi.fn(),
    push: vi.fn(),
    install: vi.fn(),
  }),
  createWebHistory: () => ({}),
}))

vi.mock('@/services/auth', () => ({
  authService: {
    getSSOConfig: (...args) => mockGetSSOConfig(...args),
  },
}))

vi.mock('@/services/mfa', () => ({
  mfaService: {
    verify: vi.fn(),
  },
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => ({
    setAuth: vi.fn(),
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

import LoginView from '../LoginView.vue'

describe('LoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSSOConfig.mockResolvedValue({ providers: [] })
  })

  function mountView() {
    return shallowMount(LoginView, {
      global: {
        stubs: {
          AuthLayout: { template: '<div><slot /></div>' },
          'router-link': { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })
  }

  it('should render email and password inputs', () => {
    const wrapper = mountView()
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
  })

  it('should render submit button', () => {
    const wrapper = mountView()
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should render forgot password link', () => {
    const wrapper = mountView()
    expect(wrapper.find('.login-form__forgot').exists()).toBe(true)
  })

  it('should call login on form submit', async () => {
    mockLogin.mockResolvedValue({})
    const wrapper = mountView()

    await wrapper.find('#email').setValue('test@test.com')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123')
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'dashboard' })
  })

  it('should show error on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('Bad credentials'))
    const wrapper = mountView()

    await wrapper.find('#email').setValue('test@test.com')
    await wrapper.find('#password').setValue('wrong')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('.login-form__error').exists()).toBe(true)
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  it('should load SSO providers on mount', async () => {
    mockGetSSOConfig.mockResolvedValue({
      providers: [{ provider: 'google', client_id: 'abc', authorize_url: 'https://google.com' }],
    })
    const wrapper = mountView()
    await flushPromises()

    expect(mockGetSSOConfig).toHaveBeenCalled()
    expect(wrapper.find('.login-form__sso').exists()).toBe(true)
  })

  it('should not show SSO section when no providers', async () => {
    mockGetSSOConfig.mockResolvedValue({ providers: [] })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.login-form__sso').exists()).toBe(false)
  })

  it('should handle SSO config failure gracefully', async () => {
    mockGetSSOConfig.mockRejectedValue(new Error('Network error'))
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.login-form__sso').exists()).toBe(false)
  })

  it('should disable submit button while loading', async () => {
    let resolveLogin
    mockLogin.mockReturnValue(new Promise((r) => { resolveLogin = r }))
    const wrapper = mountView()

    await wrapper.find('#email').setValue('test@test.com')
    await wrapper.find('#password').setValue('pass')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()

    resolveLogin({})
    await flushPromises()

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })
})
