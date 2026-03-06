import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'

const mockList = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockRemove = vi.fn()

vi.mock('@/services/admin/calendar', () => ({
  adminCalendarService: {
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

import CalendarView from '../CalendarView.vue'

const SAMPLE_HOLIDAYS = [
  {
    id: 'hol-1',
    date: '2026-01-01',
    name: 'New Year',
    type: 'NATIONAL',
    state_code: null,
  },
  {
    id: 'hol-2',
    date: '2026-09-07',
    name: 'Independence Day',
    type: 'NATIONAL',
    state_code: null,
  },
  {
    id: 'hol-3',
    date: '2026-07-09',
    name: 'Constitutionalist Revolution',
    type: 'STATE',
    state_code: 'SP',
  },
]

describe('CalendarView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockList.mockResolvedValue({ items: SAMPLE_HOLIDAYS, meta: { total: 3 } })
  })

  function mountView() {
    return shallowMount(CalendarView, {
      global: {
        stubs: {
          DefaultLayout: { template: '<div><slot /></div>' },
        },
      },
    })
  }

  it('should render the page title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('admin.calendar.title')
  })

  it('should render holiday table with correct headers', async () => {
    const wrapper = mountView()
    await flushPromises()

    const headers = wrapper.findAll('.calendar__th')
    expect(headers.length).toBe(5)
    expect(wrapper.text()).toContain('admin.calendar.table.date')
    expect(wrapper.text()).toContain('admin.calendar.table.name')
    expect(wrapper.text()).toContain('admin.calendar.table.type')
  })

  it('should load holidays on mount', async () => {
    mountView()
    await flushPromises()
    expect(mockList).toHaveBeenCalled()
  })

  it('should render holiday rows', async () => {
    const wrapper = mountView()
    await flushPromises()

    const rows = wrapper.findAll('.calendar__row')
    expect(rows.length).toBe(3)
    expect(wrapper.text()).toContain('New Year')
    expect(wrapper.text()).toContain('Independence Day')
  })

  it('should open create dialog when create button is clicked', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.calendar__modal-overlay').exists()).toBe(false)

    await wrapper.find('.calendar__create-btn').trigger('click')

    expect(wrapper.find('.calendar__modal-overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('admin.calendar.createHoliday')
  })

  it('should show empty state when no holidays', async () => {
    mockList.mockResolvedValue({ items: [], meta: { total: 0 } })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.calendar__empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('admin.calendar.empty')
  })

  it('should display state_code for STATE type holidays', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('SP')
  })
})
