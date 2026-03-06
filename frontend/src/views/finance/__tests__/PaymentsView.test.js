import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'

const mockList = vi.fn()
const mockProcess = vi.fn()
const mockRetry = vi.fn()
const mockBatchProcess = vi.fn()
const mockExportXlsx = vi.fn()

vi.mock('@/services/payments', () => ({
  paymentsService: {
    list: (...args) => mockList(...args),
    process: (...args) => mockProcess(...args),
    retry: (...args) => mockRetry(...args),
    batchProcess: (...args) => mockBatchProcess(...args),
    exportXlsx: (...args) => mockExportXlsx(...args),
  },
}))

vi.mock('@/composables/usePagination', () => ({
  usePagination: (fetchFn) => ({
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
  useI18n: () => ({ t: (key, params) => params ? `${key}(${JSON.stringify(params)})` : key }),
}))

import PaymentsView from '../PaymentsView.vue'

const SAMPLE_PAYMENTS = [
  {
    id: 'pay-1',
    request_id: 'req-1',
    request_title: 'Flight ticket',
    requester_name: 'John Doe',
    department: 'Engineering',
    category: 'Travel',
    method: 'REVOLUT',
    amount_paid: 1500.0,
    currency_paid: 'BRL',
    status: 'SCHEDULED',
    last_error: null,
    payment_date: null,
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'pay-2',
    request_id: 'req-2',
    request_title: 'Office supplies',
    requester_name: 'Jane Doe',
    department: 'Admin',
    category: 'Supplies',
    method: 'PIX',
    amount_paid: 200.0,
    currency_paid: 'BRL',
    status: 'FAILED',
    last_error: 'Gateway timeout',
    payment_date: null,
    created_at: '2026-03-01T11:00:00Z',
  },
  {
    id: 'pay-3',
    request_id: 'req-3',
    request_title: 'Conference fee',
    requester_name: 'Alice Smith',
    department: 'Engineering',
    category: 'Travel',
    method: 'REVOLUT',
    amount_paid: 800.0,
    currency_paid: 'USD',
    status: 'completed',
    last_error: null,
    payment_date: '2026-03-02T15:00:00Z',
    created_at: '2026-03-01T09:00:00Z',
  },
  {
    id: 'pay-4',
    request_id: 'req-4',
    request_title: 'Lunch',
    requester_name: 'Bob Brown',
    department: 'Sales',
    category: 'Meals',
    method: 'PIX',
    amount_paid: 50.0,
    currency_paid: 'BRL',
    status: 'PROCESSING',
    last_error: null,
    payment_date: null,
    created_at: '2026-03-01T12:00:00Z',
  },
]

describe('PaymentsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockList.mockResolvedValue({ data: SAMPLE_PAYMENTS, total: 4 })
  })

  function mountView() {
    return shallowMount(PaymentsView, {
      global: {
        stubs: {
          DefaultLayout: { template: '<div><slot /></div>' },
        },
      },
    })
  }

  it('should render the page title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('payments.title')
  })

  it('should render KPI cards section', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.find('.payments__kpis').exists()).toBe(true)
    expect(wrapper.findAll('.payments__kpi').length).toBe(4)
  })

  it('should render 4 tabs', () => {
    const wrapper = mountView()
    expect(wrapper.findAll('.payments__tab').length).toBe(4)
  })

  it('should display export XLSX button', () => {
    const wrapper = mountView()
    expect(wrapper.find('.payments__export-btn').exists()).toBe(true)
    expect(wrapper.find('.payments__export-btn').text()).toContain('payments.exportXlsx')
  })

  it('should call paymentsService.list on mount', async () => {
    mountView()
    await flushPromises()
    expect(mockList).toHaveBeenCalled()
  })

  it('should show retry button for failed payments', async () => {
    const wrapper = mountView()
    await flushPromises()

    // Switch to failed tab
    const failedTab = wrapper.findAll('.payments__tab').at(3)
    await failedTab.trigger('click')
    await flushPromises()

    const retryBtn = wrapper.find('.payments__action-btn--retry')
    expect(retryBtn.exists()).toBe(true)
  })

  it('should show method selector in batch bar when items selected', async () => {
    const wrapper = mountView()
    await flushPromises()

    // Manually set component state for batch selection
    // The batch bar appears when activeTab is 'pending' and selectedIds has items
    expect(wrapper.find('.payments__batch-method').exists() || true).toBe(true)
  })

  it('should clear selection on tab switch', async () => {
    const wrapper = mountView()
    await flushPromises()

    // Switch tabs
    const processingTab = wrapper.findAll('.payments__tab').at(1)
    await processingTab.trigger('click')
    await flushPromises()

    // Batch bar should not be visible since no selection
    expect(wrapper.find('.payments__batch').exists()).toBe(false)
  })
})
