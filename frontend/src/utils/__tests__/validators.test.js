import { describe, it, expect } from 'vitest'
import { isValidEmail, minLength, maxLength, isPositiveNumber } from '../validators'

describe('isValidEmail', () => {
  it('should return true for a valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })

  it('should return true for an email with subdomain', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true)
  })

  it('should return false for email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false)
  })

  it('should return false for email without domain', () => {
    expect(isValidEmail('user@')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('should return false for email with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false)
  })
})

describe('minLength', () => {
  it('should return true when value meets minimum length', () => {
    expect(minLength('hello', 5)).toBe(true)
  })

  it('should return true when value exceeds minimum length', () => {
    expect(minLength('hello world', 5)).toBe(true)
  })

  it('should return false when value is shorter than minimum', () => {
    expect(minLength('hi', 5)).toBe(false)
  })

  it('should return falsy for empty string with min 1', () => {
    expect(minLength('', 1)).toBeFalsy()
  })

  it('should return falsy for null value', () => {
    expect(minLength(null, 1)).toBeFalsy()
  })

  it('should return falsy for undefined value', () => {
    expect(minLength(undefined, 1)).toBeFalsy()
  })
})

describe('maxLength', () => {
  it('should return true when value is within max length', () => {
    expect(maxLength('hello', 10)).toBe(true)
  })

  it('should return true when value equals max length', () => {
    expect(maxLength('hello', 5)).toBe(true)
  })

  it('should return false when value exceeds max length', () => {
    expect(maxLength('hello world', 5)).toBe(false)
  })

  it('should return true for empty string', () => {
    expect(maxLength('', 5)).toBe(true)
  })

  it('should return true for null value', () => {
    expect(maxLength(null, 5)).toBe(true)
  })

  it('should return true for undefined value', () => {
    expect(maxLength(undefined, 5)).toBe(true)
  })
})

describe('isPositiveNumber', () => {
  it('should return true for a positive integer', () => {
    expect(isPositiveNumber(10)).toBe(true)
  })

  it('should return true for a positive decimal', () => {
    expect(isPositiveNumber(0.01)).toBe(true)
  })

  it('should return false for zero', () => {
    expect(isPositiveNumber(0)).toBe(false)
  })

  it('should return false for a negative number', () => {
    expect(isPositiveNumber(-5)).toBe(false)
  })

  it('should return false for a string', () => {
    expect(isPositiveNumber('10')).toBe(false)
  })

  it('should return false for null', () => {
    expect(isPositiveNumber(null)).toBe(false)
  })
})
