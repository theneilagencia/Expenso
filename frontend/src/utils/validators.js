export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function minLength(value, min) {
  return value && value.length >= min
}

export function maxLength(value, max) {
  return !value || value.length <= max
}

export function isPositiveNumber(value) {
  return typeof value === 'number' && value > 0
}
