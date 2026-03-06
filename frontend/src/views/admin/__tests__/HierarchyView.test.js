import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockGetTree = vi.fn()
const mockUpdateDepartmentParent = vi.fn()

vi.mock('@/services/admin/hierarchy', () => ({
  adminHierarchyService: {
    getTree: (...args) => mockGetTree(...args),
    updateDepartmentParent: (...args) => mockUpdateDepartmentParent(...args),
  },
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

import HierarchyView from '../HierarchyView.vue'

const SAMPLE_TREE = [
  {
    id: 'dept-1',
    name: 'Engineering',
    parent_id: null,
    users: [
      { id: 'user-1', name: 'Alice Smith', email: 'alice@test.com', role: 'MANAGER' },
      { id: 'user-2', name: 'Bob Brown', email: 'bob@test.com', role: 'EMPLOYEE' },
    ],
    children: [
      {
        id: 'dept-3',
        name: 'Backend Team',
        parent_id: 'dept-1',
        users: [
          { id: 'user-3', name: 'Charlie Davis', email: 'charlie@test.com', role: 'EMPLOYEE' },
        ],
        children: [],
      },
    ],
  },
  {
    id: 'dept-2',
    name: 'Sales',
    parent_id: null,
    users: [],
    children: [],
  },
]

describe('HierarchyView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTree.mockResolvedValue(SAMPLE_TREE)
  })

  function mountView() {
    return mount(HierarchyView, {
      global: {
        stubs: {
          DefaultLayout: { template: '<div><slot /></div>' },
        },
      },
    })
  }

  it('should render the page title', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('admin.hierarchy.title')
  })

  it('should load hierarchy tree on mount', async () => {
    mountView()
    await flushPromises()
    expect(mockGetTree).toHaveBeenCalled()
  })

  it('should render tree structure with department nodes', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.hierarchy__tree').exists()).toBe(true)
    expect(wrapper.text()).toContain('Engineering')
    expect(wrapper.text()).toContain('Sales')
  })

  it('should show users within departments', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Alice Smith')
    expect(wrapper.text()).toContain('Bob Brown')
  })

  it('should show empty state when no departments', async () => {
    mockGetTree.mockResolvedValue([])
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.hierarchy__empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('admin.hierarchy.empty')
  })
})
