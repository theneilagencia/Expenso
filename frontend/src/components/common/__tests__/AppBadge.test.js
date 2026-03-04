import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppBadge from '../AppBadge.vue'

describe('AppBadge', () => {
  function mountBadge(props = {}, slots = {}) {
    return mount(AppBadge, {
      props,
      slots,
      global: { stubs: {} }
    })
  }

  it('renders slot content', () => {
    const wrapper = mountBadge({ variant: 'success' }, { default: 'Active' })
    expect(wrapper.text()).toContain('Active')
  })

  it('renders with default variant (neutral) and size (md)', () => {
    const wrapper = mountBadge({}, { default: 'Default' })
    expect(wrapper.classes()).toContain('app-badge')
    expect(wrapper.classes()).toContain('app-badge--neutral')
    expect(wrapper.classes()).toContain('app-badge--md')
  })

  it('applies success variant class', () => {
    const wrapper = mountBadge({ variant: 'success' }, { default: 'OK' })
    expect(wrapper.classes()).toContain('app-badge--success')
  })

  it('applies warning variant class', () => {
    const wrapper = mountBadge({ variant: 'warning' }, { default: 'Pending' })
    expect(wrapper.classes()).toContain('app-badge--warning')
  })

  it('applies danger variant class', () => {
    const wrapper = mountBadge({ variant: 'danger' }, { default: 'Error' })
    expect(wrapper.classes()).toContain('app-badge--danger')
  })

  it('applies primary variant class', () => {
    const wrapper = mountBadge({ variant: 'primary' }, { default: 'Main' })
    expect(wrapper.classes()).toContain('app-badge--primary')
  })

  it('applies info variant class', () => {
    const wrapper = mountBadge({ variant: 'info' }, { default: 'Info' })
    expect(wrapper.classes()).toContain('app-badge--info')
  })

  it('applies sm size class', () => {
    const wrapper = mountBadge({ size: 'sm' }, { default: 'Small' })
    expect(wrapper.classes()).toContain('app-badge--sm')
  })

  it('applies md size class', () => {
    const wrapper = mountBadge({ size: 'md' }, { default: 'Medium' })
    expect(wrapper.classes()).toContain('app-badge--md')
  })

  it('renders as a span element', () => {
    const wrapper = mountBadge({}, { default: 'Badge' })
    expect(wrapper.element.tagName).toBe('SPAN')
  })

  it('renders HTML slot content', () => {
    const wrapper = mountBadge({ variant: 'success' }, { default: '<strong>Bold</strong>' })
    expect(wrapper.find('strong').exists()).toBe(true)
    expect(wrapper.find('strong').text()).toBe('Bold')
  })

  it('combines variant and size classes correctly', () => {
    const wrapper = mountBadge({ variant: 'danger', size: 'sm' }, { default: 'X' })
    expect(wrapper.classes()).toContain('app-badge')
    expect(wrapper.classes()).toContain('app-badge--danger')
    expect(wrapper.classes()).toContain('app-badge--sm')
  })
})
