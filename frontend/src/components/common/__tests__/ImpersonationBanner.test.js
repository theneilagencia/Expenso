import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'

const mockUpdateUser = vi.fn()
let mockUser = null

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => ({
    user: mockUser,
    updateUser: (...args) => mockUpdateUser(...args),
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key, params) => params ? `${key}(${JSON.stringify(params)})` : key }),
}))

import ImpersonationBanner from '../ImpersonationBanner.vue'

describe('ImpersonationBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = null
  })

  function mountBanner() {
    return shallowMount(ImpersonationBanner)
  }

  it('should show banner when impersonating', () => {
    mockUser = {
      impersonating: true,
      impersonated_user: { name: 'Jane Doe' },
    }
    const wrapper = mountBanner()

    expect(wrapper.find('.impersonation-banner').exists()).toBe(true)
  })

  it('should hide banner when not impersonating', () => {
    mockUser = { impersonating: false, impersonated_user: null }
    const wrapper = mountBanner()

    expect(wrapper.find('.impersonation-banner').exists()).toBe(false)
  })

  it('should hide banner when user is null', () => {
    mockUser = null
    const wrapper = mountBanner()

    expect(wrapper.find('.impersonation-banner').exists()).toBe(false)
  })

  it('should display the impersonated user name', () => {
    mockUser = {
      impersonating: true,
      impersonated_user: { name: 'John Smith' },
    }
    const wrapper = mountBanner()

    expect(wrapper.text()).toContain('John Smith')
  })

  it('should call updateUser to exit impersonation when exit button is clicked', async () => {
    mockUser = {
      impersonating: true,
      impersonated_user: { name: 'Jane Doe' },
    }
    const wrapper = mountBanner()

    await wrapper.find('.impersonation-banner__exit').trigger('click')

    expect(mockUpdateUser).toHaveBeenCalledWith({
      impersonating: false,
      impersonated_user: null,
    })
  })

  it('should show read-only indicator', () => {
    mockUser = {
      impersonating: true,
      impersonated_user: { name: 'Jane Doe' },
    }
    const wrapper = mountBanner()

    expect(wrapper.find('.impersonation-banner__readonly').exists()).toBe(true)
    expect(wrapper.text()).toContain('auth.impersonation.readOnly')
  })
})
