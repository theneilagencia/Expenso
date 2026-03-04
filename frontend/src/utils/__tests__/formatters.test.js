import { describe, it, expect } from 'vitest'
import { formatCurrency } from '../currency'
import { formatDate, formatDateTime } from '../date'

describe('formatCurrency', () => {
  it('should format a number as BRL currency with default locale', () => {
    const result = formatCurrency(1234.56)
    // en-US locale with BRL currency
    expect(result).toContain('1,234.56')
    expect(result).toContain('R$')
  })

  it('should format zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0.00')
  })

  it('should format negative amounts', () => {
    const result = formatCurrency(-500)
    expect(result).toContain('500.00')
  })

  it('should use custom locale', () => {
    const result = formatCurrency(1234.56, 'pt-BR', 'BRL')
    // pt-BR formats with dot as thousands separator and comma as decimal
    expect(result).toContain('1.234,56')
  })

  it('should use custom currency', () => {
    const result = formatCurrency(100, 'en-US', 'USD')
    expect(result).toContain('$')
    expect(result).toContain('100.00')
  })

  it('should format large numbers', () => {
    const result = formatCurrency(1000000)
    expect(result).toContain('1,000,000.00')
  })

  it('should handle decimal precision', () => {
    const result = formatCurrency(99.9)
    expect(result).toContain('99.90')
  })
})

describe('formatDate', () => {
  it('should format a date string to medium date style', () => {
    const result = formatDate('2026-03-04')
    // en-US medium: "Mar 4, 2026"
    expect(result).toContain('Mar')
    expect(result).toContain('2026')
  })

  it('should format an ISO date-time string', () => {
    const result = formatDate('2026-01-15T10:30:00Z')
    expect(result).toContain('Jan')
    expect(result).toContain('2026')
  })

  it('should use custom locale', () => {
    const result = formatDate('2026-03-04', 'pt-BR')
    // pt-BR medium: "4 de mar. de 2026"
    expect(result).toContain('mar')
    expect(result).toContain('2026')
  })

  it('should handle different months', () => {
    const result = formatDate('2026-12-25T12:00:00Z')
    expect(result).toContain('Dec')
    expect(result).toContain('25')
    expect(result).toContain('2026')
  })
})

describe('formatDateTime', () => {
  it('should format date with time', () => {
    const result = formatDateTime('2026-03-04T14:30:00Z')
    // Should contain date parts
    expect(result).toContain('Mar')
    expect(result).toContain('2026')
    // Should contain time parts (format depends on timezone)
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('should use custom locale', () => {
    const result = formatDateTime('2026-03-04T14:30:00Z', 'pt-BR')
    expect(result).toContain('mar')
    expect(result).toContain('2026')
  })

  it('should include both date and time components', () => {
    const result = formatDateTime('2026-06-15T09:00:00Z')
    // Date component
    expect(result).toContain('Jun')
    expect(result).toContain('15')
    expect(result).toContain('2026')
    // Time component - should have some time representation
    expect(result.length).toBeGreaterThan(formatDate('2026-06-15T09:00:00Z').length)
  })
})

describe('formatters re-exports', () => {
  it('should re-export formatCurrency from formatters module', async () => {
    const formatters = await import('../formatters')
    expect(typeof formatters.formatCurrency).toBe('function')
  })

  it('should re-export formatDate from formatters module', async () => {
    const formatters = await import('../formatters')
    expect(typeof formatters.formatDate).toBe('function')
  })

  it('should re-export formatDateTime from formatters module', async () => {
    const formatters = await import('../formatters')
    expect(typeof formatters.formatDateTime).toBe('function')
  })
})
