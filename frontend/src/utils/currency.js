export function formatCurrency(amount, locale = 'en-US', currency = 'BRL') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
}
