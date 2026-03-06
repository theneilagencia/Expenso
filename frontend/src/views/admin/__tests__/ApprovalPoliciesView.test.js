import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'

const mockList = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockRemove = vi.fn()

vi.mock('@/services/admin/approvalPolicies', () => ({
  adminApprovalPoliciesService: {
    list: (...args) => mockList(...args),
    create: (...args) => mockCreate(...args),
    update: (...args) => mockUpdate(...args),
    remove: (...args) => mockRemove(...args),
  },
}))

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
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

import ApprovalPoliciesView from '../ApprovalPoliciesView.vue'

const SAMPLE_POLICIES = [
  {
    id: 'pol-1',
    name: 'Standard Policy',
    department_name: 'Engineering',
    department_id: 'dept-1',
    min_amount: 0,
    max_amount: 5000,
    approval_flow: ['MANAGER', 'FINANCE'],
    is_active: true,
  },
  {
    id: 'pol-2',
    name: 'High Value Policy',
    department_name: 'Sales',
    department_id: 'dept-2',
    min_amount: 5000,
    max_amount: 50000,
    approval_flow: ['MANAGER', 'FINANCE', 'ADMIN'],
    is_active: false,
  },
]

describe('ApprovalPoliciesView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockList.mockResolvedValue({ items: SAMPLE_POLICIES, meta: { total: 2 } })
  })

  function mountView() {
    return shallowMount(ApprovalPoliciesView, {
      global: {
        stubs: {
          DefaultLayout: { template: '<div><slot /></div>' },
        },
      },
    })
  }

  it('should render the page title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('admin.approvalPolicies.title')
  })

  it('should render table headers when data is loaded', async () => {
    const wrapper = mountView()
    await flushPromises()

    const headers = wrapper.findAll('.policies__th')
    expect(headers.length).toBe(7)
    expect(wrapper.text()).toContain('admin.approvalPolicies.table.name')
    expect(wrapper.text()).toContain('admin.approvalPolicies.table.department')
    expect(wrapper.text()).toContain('admin.approvalPolicies.table.minAmount')
    expect(wrapper.text()).toContain('admin.approvalPolicies.table.maxAmount')
  })

  it('should load policies on mount', async () => {
    mountView()
    await flushPromises()
    expect(mockList).toHaveBeenCalled()
  })

  it('should render policy rows', async () => {
    const wrapper = mountView()
    await flushPromises()

    const rows = wrapper.findAll('.policies__row')
    expect(rows.length).toBe(2)
    expect(wrapper.text()).toContain('Standard Policy')
    expect(wrapper.text()).toContain('High Value Policy')
  })

  it('should open create dialog when create button is clicked', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.policies__modal-overlay').exists()).toBe(false)

    await wrapper.find('.policies__create-btn').trigger('click')

    expect(wrapper.find('.policies__modal-overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('admin.approvalPolicies.createPolicy')
  })

  it('should render active and inactive status badges', async () => {
    const wrapper = mountView()
    await flushPromises()

    const statusElements = wrapper.findAll('.policies__status')
    expect(statusElements.length).toBe(2)
    // First policy is active, second is inactive
    expect(statusElements[0].classes()).toContain('policies__status--active')
    expect(statusElements[1].classes()).toContain('policies__status--inactive')
  })

  it('should show empty state when no policies', async () => {
    mockList.mockResolvedValue({ items: [], meta: { total: 0 } })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.policies__empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('admin.approvalPolicies.empty')
  })
})
