import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import NotificationDropdown from '../NotificationDropdown.vue'

// Mock useNotifications composable
const mockMarkAsRead = vi.fn()
const mockMarkAllAsRead = vi.fn()
const mockNotifications = ref([])

vi.mock('@/composables/useNotifications', () => ({
  useNotifications: () => ({
    notifications: mockNotifications,
    unreadCount: computed(() => mockNotifications.value.filter(n => !n.is_read).length),
    markAsRead: mockMarkAsRead,
    markAllAsRead: mockMarkAllAsRead,
    loading: ref(false),
    fetchNotifications: vi.fn(),
  })
}))

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => {
      const translations = {
        'notifications.title': 'Notifications',
        'notifications.markAllRead': 'Mark all as read',
        'notifications.markRead': 'Mark as read',
        'notifications.noNotifications': 'No notifications',
        'notifications.justNow': 'just now',
      }
      return translations[key] || key
    }
  })
}))

function mountDropdown(props = {}) {
  return mount(NotificationDropdown, {
    props: { visible: true, ...props },
    global: { stubs: {} }
  })
}

const SAMPLE_NOTIFICATIONS = [
  { id: '1', message: 'Request approved', is_read: false, created_at: new Date().toISOString() },
  { id: '2', message: 'Payment processed', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', message: 'SLA warning', is_read: false, created_at: new Date(Date.now() - 86400000).toISOString() },
]

describe('NotificationDropdown', () => {
  beforeEach(() => {
    mockNotifications.value = []
    mockMarkAsRead.mockClear()
    mockMarkAllAsRead.mockClear()
  })

  it('renders empty state when no notifications', () => {
    const wrapper = mountDropdown()
    expect(wrapper.text()).toContain('No notifications')
  })

  it('renders notification list', () => {
    mockNotifications.value = SAMPLE_NOTIFICATIONS
    const wrapper = mountDropdown()
    expect(wrapper.text()).toContain('Request approved')
    expect(wrapper.text()).toContain('Payment processed')
    expect(wrapper.text()).toContain('SLA warning')
  })

  it('shows unread indicator for unread items', () => {
    mockNotifications.value = SAMPLE_NOTIFICATIONS
    const wrapper = mountDropdown()
    const dots = wrapper.findAll('.notification-dropdown__item-dot')
    // 2 unread items (id 1 and 3)
    expect(dots.length).toBe(2)
  })

  it('calls markAsRead when clicking mark read button', async () => {
    mockNotifications.value = SAMPLE_NOTIFICATIONS
    const wrapper = mountDropdown()
    const readButtons = wrapper.findAll('.notification-dropdown__item-read')
    expect(readButtons.length).toBe(2) // Only unread items have the button
    await readButtons[0].trigger('click')
    expect(mockMarkAsRead).toHaveBeenCalledWith('1')
  })

  it('calls markAllAsRead when clicking mark all button', async () => {
    mockNotifications.value = SAMPLE_NOTIFICATIONS
    const wrapper = mountDropdown()
    const markAllBtn = wrapper.find('.notification-dropdown__mark-all')
    expect(markAllBtn.exists()).toBe(true)
    await markAllBtn.trigger('click')
    expect(mockMarkAllAsRead).toHaveBeenCalled()
  })

  it('is hidden when visible is false', () => {
    const wrapper = mountDropdown({ visible: false })
    expect(wrapper.find('.notification-dropdown').exists()).toBe(false)
  })

  it('formats recent time as minutes', () => {
    mockNotifications.value = [
      { id: '1', message: 'Test', is_read: false, created_at: new Date(Date.now() - 120000).toISOString() }
    ]
    const wrapper = mountDropdown()
    expect(wrapper.text()).toContain('2m')
  })

  it('formats older time as hours', () => {
    mockNotifications.value = [
      { id: '1', message: 'Test', is_read: false, created_at: new Date(Date.now() - 7200000).toISOString() }
    ]
    const wrapper = mountDropdown()
    expect(wrapper.text()).toContain('2h')
  })

  it('does not show mark-all button when list is empty', () => {
    const wrapper = mountDropdown()
    expect(wrapper.find('.notification-dropdown__mark-all').exists()).toBe(false)
  })
})
