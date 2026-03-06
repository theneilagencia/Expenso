import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'

const mockSetup = vi.fn()
const mockConfirm = vi.fn()
const mockDisable = vi.fn()
const mockUpdateUser = vi.fn()

vi.mock('@/services/mfa', () => ({
  mfaService: {
    setup: (...args) => mockSetup(...args),
    confirm: (...args) => mockConfirm(...args),
    disable: (...args) => mockDisable(...args),
  },
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => ({
    user: null,
    updateUser: (...args) => mockUpdateUser(...args),
  }),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

import MFASetupView from '../MFASetupView.vue'

describe('MFASetupView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountView() {
    return shallowMount(MFASetupView, {
      global: {
        stubs: {
          DefaultLayout: { template: '<div><slot /></div>' },
        },
      },
    })
  }

  it('should render the page title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('auth.mfa.title')
  })

  it('should show enable button in initial step when MFA is not enabled', () => {
    const wrapper = mountView()
    expect(wrapper.find('.mfa__enable-btn').exists()).toBe(true)
    expect(wrapper.text()).toContain('auth.mfa.enableButton')
  })

  it('should show QR code after setup (step 2)', async () => {
    mockSetup.mockResolvedValue({ qr_data_uri: 'data:image/png;base64,abc', secret: 'SECRETKEY' })
    const wrapper = mountView()

    await wrapper.find('.mfa__enable-btn').trigger('click')
    await flushPromises()

    expect(mockSetup).toHaveBeenCalled()
    expect(wrapper.find('.mfa__qr-image').exists()).toBe(true)
    expect(wrapper.find('.mfa__secret-code').text()).toBe('SECRETKEY')
  })

  it('should show code input in step 3', async () => {
    mockSetup.mockResolvedValue({ qr_data_uri: 'data:image/png;base64,abc', secret: 'SECRETKEY' })
    const wrapper = mountView()

    // Go to step 2
    await wrapper.find('.mfa__enable-btn').trigger('click')
    await flushPromises()

    // Go to step 3
    await wrapper.find('.mfa__next-btn').trigger('click')
    await flushPromises()

    expect(wrapper.find('.mfa__code-input').exists()).toBe(true)
    expect(wrapper.find('.mfa__verify-btn').exists()).toBe(true)
  })

  it('should show disable button when MFA is already enabled', async () => {
    // Mount with MFA disabled, then set mfaEnabled via vm to simulate enabled state
    const wrapper = mountView()
    // Access the component's internal mfaEnabled ref and set it to true
    wrapper.vm.mfaEnabled = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.mfa__disable-btn').exists()).toBe(true)
    expect(wrapper.text()).toContain('auth.mfa.disable')
  })

  it('should show status card when MFA is enabled', async () => {
    const wrapper = mountView()
    wrapper.vm.mfaEnabled = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.mfa__status-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('auth.mfa.enabled')
  })

  it('should open disable modal when disable button is clicked', async () => {
    const wrapper = mountView()
    wrapper.vm.mfaEnabled = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.mfa__modal-overlay').exists()).toBe(false)

    await wrapper.find('.mfa__disable-btn').trigger('click')

    expect(wrapper.find('.mfa__modal-overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('auth.mfa.disableTitle')
  })
})
