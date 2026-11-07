import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import OrderSummary from '../components/OrderSummary'
import { EmptyState } from '../components/Feedback'
import { FALLBACK_IMAGE, FREE_SHIPPING_THRESHOLD, formatPrice } from '../utils/helpers'

export default function Cart() {
  const { items, subtotal, shipping, total, updateQuantity, removeFromCart, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="container section">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          text="Looks like you have not added anything yet."
          actionLabel="Start shopping"
          actionTo="/products"
        />
      </div>
    )
  }

  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal

  return (
    <div className="container section">
      <div className="page-title">
        <h1>Shopping cart</h1>
        <p>{items.length} item{items.length === 1 ? '' : 's'} in your cart</p>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <Link to={`/products/${item.id}`}>
                <img src={item.image_url} alt={item.name} onError={(event) => (event.currentTarget.src = FALLBACK_IMAGE)} />
              </Link>

              <div className="cart-item-info">
                <Link to={`/products/${item.id}`} className="cart-item-name">{item.name}</Link>
                <span className="cart-item-price">{formatPrice(item.price)} each</span>
                <div className="quantity-selector small">
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Decrease quantity">
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label="Increase quantity">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="cart-item-end">
                <strong>{formatPrice(item.price * item.quantity)}</strong>
                <button type="button" className="icon-button danger" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-outline btn-small" onClick={clearCart}>
            <Trash2 size={14} /> Clear cart
          </button>
        </div>

        <OrderSummary subtotal={subtotal} shipping={shipping} total={total}>
          {amountToFreeShipping > 0 ? (
            <p className="free-shipping-hint">
              Add <strong>{formatPrice(amountToFreeShipping)}</strong> more for free shipping!
            </p>
          ) : (
            <p className="free-shipping-hint success">You qualify for free shipping 🎉</p>
          )}
          <Link to="/checkout" className="btn btn-primary btn-large btn-block">
            Proceed to checkout
          </Link>
          <Link to="/products" className="continue-link">Continue shopping</Link>
        </OrderSummary>
      </div>
    </div>
  )
}

