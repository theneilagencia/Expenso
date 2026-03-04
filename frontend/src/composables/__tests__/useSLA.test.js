import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useSLA } from '../useSLA'

describe('useSLA', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function setup(slaDeadlineStr) {
    const request = ref(
      slaDeadlineStr ? { sla_deadline: slaDeadlineStr } : null
    )
    return { request, ...useSLA(request) }
  }

  describe('slaDeadline', () => {
    it('should return null when request is null', () => {
      const { slaDeadline } = setup(null)
      expect(slaDeadline.value).toBeNull()
    })

    it('should return null when request has no sla_deadline', () => {
      const request = ref({})
      const { slaDeadline } = useSLA(request)
      expect(slaDeadline.value).toBeNull()
    })

    it('should parse sla_deadline into a Date object', () => {
      const { slaDeadline } = setup('2026-03-05T12:00:00Z')
      expect(slaDeadline.value).toBeInstanceOf(Date)
      expect(slaDeadline.value.toISOString()).toBe('2026-03-05T12:00:00.000Z')
    })
  })

  describe('hoursRemaining', () => {
    it('should return null when no deadline', () => {
      const { hoursRemaining } = setup(null)
      expect(hoursRemaining.value).toBeNull()
    })

    it('should calculate hours remaining until deadline', () => {
      // Set "now" to a fixed time
      vi.setSystemTime(new Date('2026-03-04T10:00:00Z'))

      // Deadline is 8 hours away
      const { hoursRemaining } = setup('2026-03-04T18:00:00Z')
      expect(hoursRemaining.value).toBe(8)
    })

    it('should return 0 when deadline has passed', () => {
      vi.setSystemTime(new Date('2026-03-05T10:00:00Z'))

      // Deadline was yesterday
      const { hoursRemaining } = setup('2026-03-04T10:00:00Z')
      expect(hoursRemaining.value).toBe(0)
    })

    it('should floor partial hours', () => {
      vi.setSystemTime(new Date('2026-03-04T10:00:00Z'))

      // Deadline is 2h 45m away
      const { hoursRemaining } = setup('2026-03-04T12:45:00Z')
      expect(hoursRemaining.value).toBe(2)
    })
  })

  describe('isOverdue', () => {
    it('should return false when no deadline', () => {
      const { isOverdue } = setup(null)
      expect(isOverdue.value).toBe(false)
    })

    it('should return false when deadline is in the future', () => {
      vi.setSystemTime(new Date('2026-03-04T10:00:00Z'))
      const { isOverdue } = setup('2026-03-04T18:00:00Z')
      expect(isOverdue.value).toBe(false)
    })

    it('should return true when deadline has passed', () => {
      vi.setSystemTime(new Date('2026-03-05T10:00:00Z'))
      const { isOverdue } = setup('2026-03-04T18:00:00Z')
      expect(isOverdue.value).toBe(true)
    })
  })

  describe('isWarning', () => {
    it('should return false when no deadline', () => {
      const { isWarning } = setup(null)
      expect(isWarning.value).toBe(false)
    })

    it('should return false when more than 4 hours remain', () => {
      vi.setSystemTime(new Date('2026-03-04T10:00:00Z'))
      const { isWarning } = setup('2026-03-04T18:00:00Z') // 8h remaining
      expect(isWarning.value).toBe(false)
    })

    it('should return true when 4 or fewer hours remain and not overdue', () => {
      vi.setSystemTime(new Date('2026-03-04T10:00:00Z'))
      const { isWarning } = setup('2026-03-04T14:00:00Z') // 4h remaining
      expect(isWarning.value).toBe(true)
    })

    it('should return true when 1 hour remains', () => {
      vi.setSystemTime(new Date('2026-03-04T10:00:00Z'))
      const { isWarning } = setup('2026-03-04T11:00:00Z') // 1h remaining
      expect(isWarning.value).toBe(true)
    })

    it('should return false when overdue (even though hours remaining is 0)', () => {
      vi.setSystemTime(new Date('2026-03-05T10:00:00Z'))
      const { isWarning } = setup('2026-03-04T10:00:00Z') // overdue
      expect(isWarning.value).toBe(false)
    })
  })

  describe('slaStatus', () => {
    it('should return "ok" when plenty of time remains', () => {
      vi.setSystemTime(new Date('2026-03-04T10:00:00Z'))
      const { slaStatus } = setup('2026-03-04T18:00:00Z') // 8h
      expect(slaStatus.value).toBe('ok')
    })

    it('should return "warning" when 4 or fewer hours remain', () => {
      vi.setSystemTime(new Date('2026-03-04T10:00:00Z'))
      const { slaStatus } = setup('2026-03-04T13:00:00Z') // 3h
      expect(slaStatus.value).toBe('warning')
    })

    it('should return "overdue" when deadline has passed', () => {
      vi.setSystemTime(new Date('2026-03-05T10:00:00Z'))
      const { slaStatus } = setup('2026-03-04T10:00:00Z')
      expect(slaStatus.value).toBe('overdue')
    })

    it('should return "ok" when no deadline is set (no overdue, no warning)', () => {
      const { slaStatus } = setup(null)
      expect(slaStatus.value).toBe('ok')
    })
  })

  describe('reactive updates', () => {
    it('should recompute when request ref changes', () => {
      vi.setSystemTime(new Date('2026-03-04T10:00:00Z'))

      const request = ref({ sla_deadline: '2026-03-04T18:00:00Z' })
      const { slaStatus, hoursRemaining } = useSLA(request)

      expect(slaStatus.value).toBe('ok')
      expect(hoursRemaining.value).toBe(8)

      // Update request to a closer deadline
      request.value = { sla_deadline: '2026-03-04T12:00:00Z' }
      expect(hoursRemaining.value).toBe(2)
      expect(slaStatus.value).toBe('warning')
    })
  })
})
