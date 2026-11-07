import { formatPrice } from '../utils/helpers'

// Price breakdown shared by the Cart and Checkout pages.
export default function OrderSummary({ subtotal, shipping, total, children }) {
  return (
    <aside className="summary">
      <h2>Order summary</h2>
      {children}
      <div className="summary-row">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="summary-row">
        <span>Shipping</span>
        <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
      </div>
      <div className="summary-row summary-total">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </aside>
  )
}

