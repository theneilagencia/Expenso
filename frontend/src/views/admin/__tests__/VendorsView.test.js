import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'

const mockList = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockRemove = vi.fn()

vi.mock('@/services/admin/vendors', () => ({
  adminVendorsService: {
    list: (...args) => mockList(...args),
    create: (...args) => mockCreate(...args),
    update: (...args) => mockUpdate(...args),
    remove: (...args) => mockRemove(...args),
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

import VendorsView from '../VendorsView.vue'

const SAMPLE_VENDORS = [
  {
    id: 'ven-1',
    name: 'Acme Corp',
    document: '12.345.678/0001-00',
    list_type: 'WHITELIST',
    category_name: 'Technology',
    reason: 'Approved vendor',
    valid_from: '2026-01-01',
    valid_until: '2026-12-31',
  },
  {
    id: 'ven-2',
    name: 'Shady LLC',
    document: '98.765.432/0001-00',
    list_type: 'BLACKLIST',
    category_name: null,
    reason: 'Fraud detected',
    valid_from: '2025-06-01',
    valid_until: null,
  },
]

describe('VendorsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockList.mockResolvedValue({ items: SAMPLE_VENDORS, meta: { total: 2 } })
  })

  function mountView() {
    return shallowMount(VendorsView, {
      global: {
        stubs: {
          DefaultLayout: { template: '<div><slot /></div>' },
        },
      },
    })
  }

  it('should render the page title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('admin.vendors.title')
  })

  it('should render vendor table with correct headers', async () => {
    const wrapper = mountView()
    await flushPromises()

    const headers = wrapper.findAll('.vendors__th')
    expect(headers.length).toBe(8)
    expect(wrapper.text()).toContain('admin.vendors.table.name')
    expect(wrapper.text()).toContain('admin.vendors.table.listType')
  })

  it('should load vendors on mount', async () => {
    mountView()
    await flushPromises()
    expect(mockList).toHaveBeenCalled()
  })

  it('should render vendor rows', async () => {
    const wrapper = mountView()
    await flushPromises()

    const rows = wrapper.findAll('.vendors__row')
    expect(rows.length).toBe(2)
    expect(wrapper.text()).toContain('Acme Corp')
    expect(wrapper.text()).toContain('Shady LLC')
  })

  it('should have a filter select for list_type', async () => {
    const wrapper = mountView()
    await flushPromises()

    const filterSelect = wrapper.find('.vendors__filter-select')
    expect(filterSelect.exists()).toBe(true)
    const options = filterSelect.findAll('option')
    expect(options.length).toBe(3)
  })

  it('should open create dialog when create button is clicked', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.vendors__modal-overlay').exists()).toBe(false)

    await wrapper.find('.vendors__create-btn').trigger('click')

    expect(wrapper.find('.vendors__modal-overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('admin.vendors.createVendor')
  })

  it('should show empty state when no vendors', async () => {
    mockList.mockResolvedValue({ items: [], meta: { total: 0 } })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.vendors__empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('admin.vendors.empty')
  })

  it('should render edit and delete action buttons for each vendor', async () => {
    const wrapper = mountView()
    await flushPromises()

    const editButtons = wrapper.findAll('.vendors__action-btn:not(.vendors__action-btn--danger)')
    const deleteButtons = wrapper.findAll('.vendors__action-btn--danger')
    expect(editButtons.length).toBe(2)
    expect(deleteButtons.length).toBe(2)
  })
})
