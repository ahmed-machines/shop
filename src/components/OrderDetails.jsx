import { FALLBACK_IMAGE, formatPrice } from '../services/helpers'

export function StatusBadge({ status }) {
  return <span className={`status status-${status}`}>{status}</span>
}

// Full details of one order: items, address and price breakdown.
// Used by My Orders, the order success page and the admin order manager.
export default function OrderDetails({ order }) {
  return (
    <div className="order-details">
      <ul className="order-items">
        {order.order_items.map((item) => (
          <li key={item.id}>
            <img src={item.image_url || FALLBACK_IMAGE} alt="" onError={(event) => (event.currentTarget.src = FALLBACK_IMAGE)} />
            <div>
              <strong>{item.product_name}</strong>
              <span>{item.quantity} × {formatPrice(item.unit_price)}</span>
            </div>
            <strong>{formatPrice(item.quantity * item.unit_price)}</strong>
          </li>
        ))}
      </ul>

      <div className="order-meta">
        <div>
          <h4>Shipping to</h4>
          <p>
            {order.customer_name}<br />
            {order.shipping_address}, {order.city}<br />
            {order.phone}
          </p>
          {order.notes && <p className="muted">Note: {order.notes}</p>}
          <p className="muted">Payment: cash on delivery</p>
        </div>
        <div className="order-totals">
          <div><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          <div><span>Shipping</span><span>{Number(order.shipping_cost) === 0 ? 'Free' : formatPrice(order.shipping_cost)}</span></div>
          <div className="order-total-line"><span>Total</span><span>{formatPrice(order.total)}</span></div>
        </div>
      </div>
    </div>
  )
}

