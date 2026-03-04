import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useToast } from '../useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Clear any leftover toasts from previous tests
    const { toasts } = useToast()
    toasts.value = []
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should add a success toast', () => {
    const { toasts, success } = useToast()
    success('Done!')
    expect(toasts.value.length).toBe(1)
    expect(toasts.value[0].type).toBe('success')
    expect(toasts.value[0].message).toBe('Done!')
  })

  it('should add an error toast', () => {
    const { toasts, error } = useToast()
    error('Failed!')
    expect(toasts.value.length).toBe(1)
    expect(toasts.value[0].type).toBe('error')
    expect(toasts.value[0].message).toBe('Failed!')
  })

  it('should add a warning toast', () => {
    const { toasts, warning } = useToast()
    warning('Careful!')
    expect(toasts.value.length).toBe(1)
    expect(toasts.value[0].type).toBe('warning')
    expect(toasts.value[0].message).toBe('Careful!')
  })

  it('should add an info toast', () => {
    const { toasts, info } = useToast()
    info('FYI')
    expect(toasts.value.length).toBe(1)
    expect(toasts.value[0].type).toBe('info')
    expect(toasts.value[0].message).toBe('FYI')
  })

  it('should assign unique ids to each toast', () => {
    const { toasts, success, error } = useToast()
    success('First')
    error('Second')
    expect(toasts.value.length).toBe(2)
    expect(toasts.value[0].id).not.toBe(toasts.value[1].id)
  })

  it('should remove toast after dismiss', () => {
    const { toasts, success, dismiss } = useToast()
    success('Temp')
    const id = toasts.value[0].id
    dismiss(id)
    expect(toasts.value.length).toBe(0)
  })

  it('should auto-dismiss success toast after default duration (4000ms)', () => {
    const { toasts, success } = useToast()
    success('Auto')
    expect(toasts.value.length).toBe(1)
    vi.advanceTimersByTime(4000)
    expect(toasts.value.length).toBe(0)
  })

  it('should auto-dismiss error toast after 6000ms', () => {
    const { toasts, error } = useToast()
    error('Error auto')
    expect(toasts.value.length).toBe(1)
    vi.advanceTimersByTime(4000)
    expect(toasts.value.length).toBe(1) // still present at 4s
    vi.advanceTimersByTime(2000)
    expect(toasts.value.length).toBe(0) // gone at 6s
  })

  it('should support show() with custom duration', () => {
    const { toasts, show } = useToast()
    show({ message: 'Custom', type: 'info', duration: 2000 })
    expect(toasts.value.length).toBe(1)
    vi.advanceTimersByTime(2000)
    expect(toasts.value.length).toBe(0)
  })

  it('should not auto-dismiss when duration is 0', () => {
    const { toasts, show } = useToast()
    show({ message: 'Sticky', type: 'info', duration: 0 })
    expect(toasts.value.length).toBe(1)
    vi.advanceTimersByTime(10000)
    expect(toasts.value.length).toBe(1)
  })

  it('should return the toast id from show methods', () => {
    const { success } = useToast()
    const id = success('Return id')
    expect(typeof id).toBe('number')
    expect(id).toBeGreaterThan(0)
  })
})
