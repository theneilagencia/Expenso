import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppBadge from '../AppBadge.vue'

describe('AppBadge', () => {
  function mountBadge(props = {}, slots = {}) {
    return mount(AppBadge, {
      props,
      slots,
      global: {
        stubs: {
          BtsBadge: {
            template: '<span class="bts-badge" :class="`bts-badge--${variant}`"><slot /></span>',
            props: ['variant', 'label']
          }
        }
      }
    })
  }

  it('renders slot content', () => {
    const wrapper = mountBadge({ variant: 'success' }, { default: 'Active' })
    expect(wrapper.text()).toContain('Active')
  })

  it('renders with default variant (neutral → default) and size (md)', () => {
    const wrapper = mountBadge({}, { default: 'Default' })
    expect(wrapper.find('.bts-badge').exists()).toBe(true)
    expect(wrapper.find('.bts-badge--default').exists()).toBe(true)
    expect(wrapper.find('.app-badge--md').exists()).toBe(true)
  })

  it('applies success variant class', () => {
    const wrapper = mountBadge({ variant: 'success' }, { default: 'OK' })
    expect(wrapper.find('.bts-badge--success').exists()).toBe(true)
  })

  it('applies warning variant class', () => {
    const wrapper = mountBadge({ variant: 'warning' }, { default: 'Pending' })
    expect(wrapper.find('.bts-badge--warning').exists()).toBe(true)
  })

  it('applies danger variant class', () => {
    const wrapper = mountBadge({ variant: 'danger' }, { default: 'Error' })
    expect(wrapper.find('.bts-badge--danger').exists()).toBe(true)
  })

  it('applies primary variant class', () => {
    const wrapper = mountBadge({ variant: 'primary' }, { default: 'Main' })
    expect(wrapper.find('.bts-badge--primary').exists()).toBe(true)
  })

  it('applies info variant class', () => {
    const wrapper = mountBadge({ variant: 'info' }, { default: 'Info' })
    expect(wrapper.find('.bts-badge--info').exists()).toBe(true)
  })

  it('applies sm size class', () => {
    const wrapper = mountBadge({ size: 'sm' }, { default: 'Small' })
    expect(wrapper.find('.app-badge--sm').exists()).toBe(true)
  })

  it('applies md size class', () => {
    const wrapper = mountBadge({ size: 'md' }, { default: 'Medium' })
    expect(wrapper.find('.app-badge--md').exists()).toBe(true)
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
    expect(wrapper.find('.bts-badge').exists()).toBe(true)
    expect(wrapper.find('.bts-badge--danger').exists()).toBe(true)
    expect(wrapper.find('.app-badge--sm').exists()).toBe(true)
  })
})
