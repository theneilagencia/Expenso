import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'

const mockList = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockRemove = vi.fn()
const mockTest = vi.fn()

vi.mock('@/services/admin/webhooks', () => ({
  adminWebhooksService: {
    list: (...args) => mockList(...args),
    create: (...args) => mockCreate(...args),
    update: (...args) => mockUpdate(...args),
    remove: (...args) => mockRemove(...args),
    test: (...args) => mockTest(...args),
  },
}))

vi.mock('@/composables/usePagination', () => ({
  usePagination: () => ({
    page: { value: 1 },
    totalPages: { value: 1 },
    hasNext: { value: false },
    hasPrev: { value: false },
    nextPage: vi.fn(),
    prevPage: vi.fn(),
    setTotal: vi.fn(),
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

import WebhooksView from '../WebhooksView.vue'

const SAMPLE_WEBHOOKS = [
  {
    id: 'wh-1',
    url: 'https://example.com/webhook',
    events: ['request.created', 'request.approved'],
    active: true,
    last_status: 200,
  },
  {
    id: 'wh-2',
    url: 'https://other.com/hook',
    events: ['payment.completed'],
    active: false,
    last_status: 500,
  },
]

describe('WebhooksView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockList.mockResolvedValue({ items: SAMPLE_WEBHOOKS, meta: { total: 2 } })
  })

  function mountView() {
    return shallowMount(WebhooksView, {
      global: {
        stubs: {
          DefaultLayout: { template: '<div><slot /></div>' },
        },
      },
    })
  }

  it('should render the page title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('admin.webhooks.title')
  })

  it('should render webhook table with correct headers', async () => {
    const wrapper = mountView()
    await flushPromises()

    const headers = wrapper.findAll('.webhooks__th')
    expect(headers.length).toBe(5)
    expect(wrapper.text()).toContain('admin.webhooks.table.url')
    expect(wrapper.text()).toContain('admin.webhooks.table.events')
    expect(wrapper.text()).toContain('admin.webhooks.table.active')
  })

  it('should load webhooks on mount', async () => {
    mountView()
    await flushPromises()
    expect(mockList).toHaveBeenCalled()
  })

  it('should render webhook rows', async () => {
    const wrapper = mountView()
    await flushPromises()

    const rows = wrapper.findAll('.webhooks__row')
    expect(rows.length).toBe(2)
    expect(wrapper.text()).toContain('https://example.com/webhook')
    expect(wrapper.text()).toContain('https://other.com/hook')
  })

  it('should open create dialog when create button is clicked', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.webhooks__modal-overlay').exists()).toBe(false)

    await wrapper.find('.webhooks__create-btn').trigger('click')

    expect(wrapper.find('.webhooks__modal-overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('admin.webhooks.createWebhook')
  })

  it('should render test button for each webhook', async () => {
    const wrapper = mountView()
    await flushPromises()

    const testButtons = wrapper.findAll('.webhooks__action-btn--secondary')
    expect(testButtons.length).toBe(2)
    expect(testButtons[0].text()).toContain('admin.webhooks.test')
  })

  it('should show empty state when no webhooks', async () => {
    mockList.mockResolvedValue({ items: [], meta: { total: 0 } })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.webhooks__empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('admin.webhooks.empty')
  })

  it('should display event badges for each webhook', async () => {
    const wrapper = mountView()
    await flushPromises()

    const eventBadges = wrapper.findAll('.webhooks__event-badge')
    // First webhook has 2 events, second has 1 = 3 total
    expect(eventBadges.length).toBe(3)
    expect(eventBadges[0].text()).toBe('request.created')
  })
})
