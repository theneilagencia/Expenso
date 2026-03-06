import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('vue-chartjs', () => ({
  Doughnut: {
    name: 'Doughnut',
    template: '<div class="mock-doughnut"></div>',
    props: ['data', 'options'],
  },
  Line: {
    name: 'Line',
    template: '<div class="mock-line"></div>',
    props: ['data', 'options'],
  },
  Bar: {
    name: 'Bar',
    template: '<div class="mock-bar"></div>',
    props: ['data', 'options'],
  },
}))

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  ArcElement: {},
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  PointElement: {},
  LineElement: {},
  Filler: {},
  Tooltip: {},
  Legend: {},
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key) => key }),
}))

import SpendingByCategoryChart from '@/components/charts/SpendingByCategoryChart.vue'
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart.vue'
import StatusBreakdownChart from '@/components/charts/StatusBreakdownChart.vue'
import DepartmentComparisonChart from '@/components/charts/DepartmentComparisonChart.vue'

describe('SpendingByCategoryChart', () => {
  it('shows loading state', () => {
    const wrapper = mount(SpendingByCategoryChart, {
      props: { data: [], loading: true },
    })

    expect(wrapper.find('.category-chart__loading').exists()).toBe(true)
    expect(wrapper.find('.category-chart__loading').text()).toBe('common.loading')
    expect(wrapper.find('.mock-doughnut').exists()).toBe(false)
  })

  it('shows empty state when data is empty', () => {
    const wrapper = mount(SpendingByCategoryChart, {
      props: { data: [], loading: false },
    })

    expect(wrapper.find('.category-chart__empty').exists()).toBe(true)
    expect(wrapper.find('.category-chart__empty').text()).toBe('reports.charts.noData')
    expect(wrapper.find('.mock-doughnut').exists()).toBe(false)
  })

  it('renders doughnut chart when data is provided', () => {
    const wrapper = mount(SpendingByCategoryChart, {
      props: {
        data: [
          { category: 'Travel', total: 5000 },
          { category: 'Food', total: 2000 },
        ],
        loading: false,
      },
    })

    expect(wrapper.find('.mock-doughnut').exists()).toBe(true)
    expect(wrapper.find('.category-chart__empty').exists()).toBe(false)
    expect(wrapper.find('.category-chart__loading').exists()).toBe(false)
  })
})

describe('MonthlyTrendChart', () => {
  it('shows empty state when data is empty', () => {
    const wrapper = mount(MonthlyTrendChart, {
      props: { data: [], loading: false },
    })

    expect(wrapper.find('.monthly-chart__empty').exists()).toBe(true)
    expect(wrapper.find('.monthly-chart__empty').text()).toBe('reports.charts.noData')
    expect(wrapper.find('.mock-line').exists()).toBe(false)
  })

  it('renders line chart when data is provided', () => {
    const wrapper = mount(MonthlyTrendChart, {
      props: {
        data: [
          { year: 2026, month: 1, total: 3000 },
          { year: 2026, month: 2, total: 4500 },
        ],
        loading: false,
      },
    })

    expect(wrapper.find('.mock-line').exists()).toBe(true)
    expect(wrapper.find('.monthly-chart__empty').exists()).toBe(false)
  })
})

describe('StatusBreakdownChart', () => {
  it('shows empty state when data is empty object', () => {
    const wrapper = mount(StatusBreakdownChart, {
      props: { data: {}, loading: false },
    })

    expect(wrapper.find('.status-chart__empty').exists()).toBe(true)
    expect(wrapper.find('.status-chart__empty').text()).toBe('reports.charts.noData')
    expect(wrapper.find('.mock-bar').exists()).toBe(false)
  })

  it('renders bar chart when data is provided', () => {
    const wrapper = mount(StatusBreakdownChart, {
      props: {
        data: { DRAFT: 5, PENDING_AI: 3, PAID: 10 },
        loading: false,
      },
    })

    expect(wrapper.find('.mock-bar').exists()).toBe(true)
    expect(wrapper.find('.status-chart__empty').exists()).toBe(false)
  })
})

describe('DepartmentComparisonChart', () => {
  it('renders bar chart when data is provided', () => {
    const wrapper = mount(DepartmentComparisonChart, {
      props: {
        data: [
          { department: 'Engineering', total: 15000 },
          { department: 'Marketing', total: 8000 },
        ],
        loading: false,
      },
    })

    expect(wrapper.find('.mock-bar').exists()).toBe(true)
    expect(wrapper.find('.department-chart__empty').exists()).toBe(false)
    expect(wrapper.find('.department-chart__loading').exists()).toBe(false)
  })
})
