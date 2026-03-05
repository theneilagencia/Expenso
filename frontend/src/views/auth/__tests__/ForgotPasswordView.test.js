import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'

const mockRequestPasswordReset = vi.fn()

vi.mock('@/services/auth', () => ({
  authService: {
    requestPasswordReset: (...args) => mockRequestPasswordReset(...args),
  },
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

import ForgotPasswordView from '../ForgotPasswordView.vue'

describe('ForgotPasswordView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountView() {
    return shallowMount(ForgotPasswordView, {
      global: {
        stubs: {
          AuthLayout: { template: '<div><slot /></div>' },
          'router-link': { template: '<a><slot /></a>', props: ['to'] },
        },
      },
    })
  }

  it('should render email input and submit button', () => {
    const wrapper = mountView()
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should render description text', () => {
    const wrapper = mountView()
    expect(wrapper.find('.forgot-form__text').text()).toBe('auth.forgotPasswordText')
  })

  it('should render back to login link', () => {
    const wrapper = mountView()
    expect(wrapper.find('.forgot-form__back').exists()).toBe(true)
  })

  it('should call requestPasswordReset on submit', async () => {
    mockRequestPasswordReset.mockResolvedValue({})
    const wrapper = mountView()

    await wrapper.find('#email').setValue('test@test.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mockRequestPasswordReset).toHaveBeenCalledWith('test@test.com')
  })

  it('should show success state after successful submit', async () => {
    mockRequestPasswordReset.mockResolvedValue({})
    const wrapper = mountView()

    await wrapper.find('#email').setValue('test@test.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.find('.forgot-form__success').exists()).toBe(true)
  })

  it('should show error on failed submit', async () => {
    mockRequestPasswordReset.mockRejectedValue(new Error('Failed'))
    const wrapper = mountView()

    await wrapper.find('#email').setValue('test@test.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('.forgot-form__error').exists()).toBe(true)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('should disable submit button while loading', async () => {
    let resolveReset
    mockRequestPasswordReset.mockReturnValue(new Promise((r) => { resolveReset = r }))
    const wrapper = mountView()

    await wrapper.find('#email').setValue('test@test.com')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()

    resolveReset({})
    await flushPromises()
  })
})
