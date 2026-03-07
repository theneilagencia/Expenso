import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'

const mockRouterPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: (...args) => mockRouterPush(...args) }),
  createRouter: () => ({
    beforeEach: vi.fn(),
    push: vi.fn(),
    install: vi.fn(),
  }),
  createWebHistory: () => ({}),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

import LandingView from '../LandingView.vue'

describe('LandingView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountView() {
    return shallowMount(LandingView, {
      global: {
        stubs: {
          BtsButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['variant', 'size'],
          },
          BtsIcon: { template: '<span class="icon-stub" />', props: ['name', 'prefix'] },
          BtsBadge: { template: '<span class="badge-stub"><slot /></span>', props: ['variant'] },
          LocaleSwitcher: { template: '<div class="locale-switcher-stub" />' },
        },
      },
    })
  }

  it('should render the hero section with title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('landing.hero.title')
  })

  it('should render the hero subtitle', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('landing.hero.subtitle')
  })

  it('should render the hero badge', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('landing.hero.badge')
  })

  it('should render 6 feature cards', () => {
    const wrapper = mountView()
    const cards = wrapper.findAll('.landing__feature-card')
    expect(cards).toHaveLength(6)
  })

  it('should render 5 AI role cards', () => {
    const wrapper = mountView()
    const roles = wrapper.findAll('.landing__ai-card')
    expect(roles).toHaveLength(5)
  })

  it('should render 4 how-it-works steps', () => {
    const wrapper = mountView()
    const steps = wrapper.findAll('.landing__step')
    expect(steps).toHaveLength(4)
  })

  it('should render step numbers 1 through 4', () => {
    const wrapper = mountView()
    const numbers = wrapper.findAll('.landing__step-number')
    expect(numbers.map((n) => n.text())).toEqual(['1', '2', '3', '4'])
  })

  it('should navigate to login when hero CTA is clicked', async () => {
    const wrapper = mountView()
    const buttons = wrapper.findAll('button')
    const ctaButton = buttons.find((b) => b.text().includes('landing.hero.cta'))
    await ctaButton.trigger('click')
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'login' })
  })

  it('should navigate to login when footer CTA is clicked', async () => {
    const wrapper = mountView()
    const buttons = wrapper.findAll('button')
    const ctaButton = buttons.find((b) => b.text().includes('landing.cta.button'))
    await ctaButton.trigger('click')
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'login' })
  })

  it('should render the locale switcher', () => {
    const wrapper = mountView()
    expect(wrapper.find('.locale-switcher-stub').exists()).toBe(true)
  })

  it('should render the CTA section title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('landing.cta.title')
  })

  it('should render the footer copyright', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('landing.footer.copyright')
  })

  it('should render the features section title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('landing.features.title')
  })

  it('should render the AI highlight section title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('landing.aiHighlight.title')
  })

  it('should render the how-it-works section title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('landing.howItWorks.title')
  })
})
