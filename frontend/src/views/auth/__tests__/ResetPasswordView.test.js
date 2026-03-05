import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'

const mockConfirmPasswordReset = vi.fn()

vi.mock('@/services/auth', () => ({
  authService: {
    confirmPasswordReset: (...args) => mockConfirmPasswordReset(...args),
  },
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: { token: 'reset-token-123' },
  }),
}))

import ResetPasswordView from '../ResetPasswordView.vue'

describe('ResetPasswordView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountView() {
    return shallowMount(ResetPasswordView, {
      global: {
        stubs: {
          AuthLayout: { template: '<div><slot /></div>' },
          'router-link': { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })
  }

  it('should render password and confirm inputs', () => {
    const wrapper = mountView()
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('#confirm').exists()).toBe(true)
  })

  it('should render submit button', () => {
    const wrapper = mountView()
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should show password mismatch error', async () => {
    const wrapper = mountView()

    await wrapper.find('#password').setValue('newpass123')
    await wrapper.find('#confirm').setValue('different')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('.reset-form__error').text()).toBe('auth.passwordMismatch')
    expect(mockConfirmPasswordReset).not.toHaveBeenCalled()
  })

  it('should call confirmPasswordReset with token and password', async () => {
    mockConfirmPasswordReset.mockResolvedValue({})
    const wrapper = mountView()

    await wrapper.find('#password').setValue('newpass123')
    await wrapper.find('#confirm').setValue('newpass123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockConfirmPasswordReset).toHaveBeenCalledWith('reset-token-123', 'newpass123')
  })

  it('should show success state after reset', async () => {
    mockConfirmPasswordReset.mockResolvedValue({})
    const wrapper = mountView()

    await wrapper.find('#password').setValue('newpass123')
    await wrapper.find('#confirm').setValue('newpass123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.find('.reset-form__success').exists()).toBe(true)
  })

  it('should show error on API failure', async () => {
    mockConfirmPasswordReset.mockRejectedValue(new Error('Token expired'))
    const wrapper = mountView()

    await wrapper.find('#password').setValue('newpass123')
    await wrapper.find('#confirm').setValue('newpass123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('.reset-form__error').text()).toBe('auth.resetFailed')
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('should disable submit button while loading', async () => {
    let resolveReset
    mockConfirmPasswordReset.mockReturnValue(new Promise((r) => { resolveReset = r }))
    const wrapper = mountView()

    await wrapper.find('#password').setValue('newpass123')
    await wrapper.find('#confirm').setValue('newpass123')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()

    resolveReset({})
    await flushPromises()
  })
})
