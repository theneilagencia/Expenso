import { describe, it, expect } from 'vitest'
import { formatCurrency } from '../currency'

describe('formatCurrency', () => {
  describe('BRL formatting', () => {
    it('should format a positive amount as BRL with en-US locale by default', () => {
      const result = formatCurrency(1234.56)
      expect(result).toContain('R$')
      expect(result).toContain('1,234.56')
    })

    it('should format BRL with pt-BR locale', () => {
      const result = formatCurrency(1234.56, 'pt-BR', 'BRL')
      expect(result).toContain('R$')
      expect(result).toContain('1.234,56')
    })
  })

  describe('USD formatting', () => {
    it('should format USD with en-US locale', () => {
      const result = formatCurrency(999.99, 'en-US', 'USD')
      expect(result).toContain('$')
      expect(result).toContain('999.99')
    })
  })

  describe('EUR formatting', () => {
    it('should format EUR with en-US locale', () => {
      const result = formatCurrency(500, 'en-US', 'EUR')
      expect(result).toContain('500.00')
    })
  })

  describe('edge cases', () => {
    it('should format zero', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0.00')
    })

    it('should format negative amounts', () => {
      const result = formatCurrency(-250.5)
      expect(result).toContain('250.50')
    })

    it('should format large numbers with grouping separators', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('1,000,000.00')
    })

    it('should handle decimal precision (round to 2 decimals)', () => {
      const result = formatCurrency(99.9)
      expect(result).toContain('99.90')
    })

    it('should handle very small amounts', () => {
      const result = formatCurrency(0.01)
      expect(result).toContain('0.01')
    })
  })
})
