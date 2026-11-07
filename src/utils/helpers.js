// Small helper functions used across the app.

export const FREE_SHIPPING_THRESHOLD = 100
export const SHIPPING_FEE = 9.99

// Price after discount, rounded to 2 decimals.
export function getFinalPrice(product) {
  const discount = product.discount_percent || 0
  return Math.round(Number(product.price) * (100 - discount)) / 100
}

export function formatPrice(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Same rule as the place_order function in supabase/01_schema.sql.
export function calculateShipping(subtotal) {
  if (subtotal === 0) return 0
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
}

export function makeSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

// Used when a product image fails to load.
export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#eef0f6"/><text x="50%" y="50%" fill="#9aa1b5" font-family="sans-serif" font-size="20" text-anchor="middle">No image</text></svg>',
  )

