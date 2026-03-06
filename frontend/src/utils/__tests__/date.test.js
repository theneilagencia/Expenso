import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime } from '../date'

describe('formatDate', () => {
  it('should format a date string to medium date style in en-US', () => {
    const result = formatDate('2026-03-04')
    expect(result).toContain('Mar')
    expect(result).toContain('2026')
  })

  it('should format an ISO date-time string', () => {
    const result = formatDate('2026-01-15T10:30:00Z')
    expect(result).toContain('Jan')
    expect(result).toContain('2026')
  })

  it('should use pt-BR locale', () => {
    const result = formatDate('2026-03-04', 'pt-BR')
    expect(result).toContain('mar')
    expect(result).toContain('2026')
  })

  it('should format December date correctly', () => {
    const result = formatDate('2026-12-25T12:00:00Z')
    expect(result).toContain('Dec')
    expect(result).toContain('25')
    expect(result).toContain('2026')
  })

  it('should format first day of year', () => {
    const result = formatDate('2026-01-01T12:00:00Z')
    expect(result).toContain('Jan')
    expect(result).toContain('2026')
  })

  it('should format a summer month', () => {
    const result = formatDate('2026-07-15T12:00:00Z')
    expect(result).toContain('Jul')
    expect(result).toContain('15')
  })
})

describe('formatDateTime', () => {
  it('should format date with time in en-US', () => {
    const result = formatDateTime('2026-03-04T14:30:00Z')
    expect(result).toContain('Mar')
    expect(result).toContain('2026')
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('should use pt-BR locale', () => {
    const result = formatDateTime('2026-03-04T14:30:00Z', 'pt-BR')
    expect(result).toContain('mar')
    expect(result).toContain('2026')
  })

  it('should include both date and time components', () => {
    const result = formatDateTime('2026-06-15T09:00:00Z')
    expect(result).toContain('Jun')
    expect(result).toContain('15')
    expect(result).toContain('2026')
    expect(result.length).toBeGreaterThan(formatDate('2026-06-15T09:00:00Z').length)
  })

  it('should format midnight time', () => {
    const result = formatDateTime('2026-03-01T00:00:00Z')
    expect(result).toContain('2026')
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })
})
