import { createContext, useContext, useEffect, useState } from 'react'
import { calculateShipping, getFinalPrice } from '../services/helpers'

// Context API lets any component read the cart without passing props through every level.
const CartContext = createContext(null)

const STORAGE_KEY = 'shopsphere-cart'

// Reads the saved cart from localStorage when the app starts.
function loadSavedCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return [] // corrupted data -> start with an empty cart
  }
}

export function CartProvider({ children }) {
  // The lazy initial value (a function) runs only once, on the first render.
  const [items, setItems] = useState(loadSavedCart)

  // Every time the cart changes, save it. This is why the cart survives a page refresh.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addToCart(product, quantity = 1) {
    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.id === product.id)
      if (existing) {
        // Product already in cart: increase the quantity, but never above the stock.
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, stock: product.stock, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item,
        )
      }
      // New product: store only the fields the cart needs.
      const newItem = {
        id: product.id,
        name: product.name,
        image_url: product.image_url,
        price: getFinalPrice(product),
        stock: product.stock,
        quantity: Math.min(quantity, product.stock),
      }
      return [...currentItems, newItem]
    })
  }

  function removeFromCart(productId) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId))
  }

  function updateQuantity(productId, quantity) {
    if (quantity < 1) return
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item,
      ),
    )
  }

  function clearCart() {
    setItems([])
  }

  // Values calculated from the items (no extra state needed).
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = Math.round(items.reduce((total, item) => total + item.price * item.quantity, 0) * 100) / 100
  const shipping = calculateShipping(subtotal)
  const total = Math.round((subtotal + shipping) * 100) / 100

  const value = { items, itemCount, subtotal, shipping, total, addToCart, removeFromCart, updateQuantity, clearCart }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Custom hook: components call useCart() instead of useContext(CartContext).
export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside <CartProvider>')
  return context
}

