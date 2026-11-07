import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, PackageOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../services/orderService'
import { EmptyState, ErrorMessage, Loader, SetupNotice } from '../components/Feedback'
import OrderDetails, { StatusBadge } from '../components/OrderDetails'
import { formatDate, formatPrice } from '../utils/helpers'

export default function MyOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openOrderId, setOpenOrderId] = useState(null) // which order is expanded

  useEffect(() => {
    getMyOrders(user.id)
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user.id])

  return (
    <div className="container section narrow">
      <div className="page-title">
        <h1>My orders</h1>
        <p>Track your purchases and see their status.</p>
      </div>

      <SetupNotice />
      {loading && <Loader text="Loading your orders..." />}
      <ErrorMessage message={error} />

      {!loading && !error && orders.length === 0 && (
        <EmptyState icon={PackageOpen} title="No orders yet" text="When you place an order it will appear here." actionLabel="Start shopping" actionTo="/products" />
      )}

      <div className="order-list">
        {orders.map((order) => {
          const isOpen = openOrderId === order.id
          return (
            <div className="card order-card" key={order.id}>
              <button type="button" className="order-header" onClick={() => setOpenOrderId(isOpen ? null : order.id)} aria-expanded={isOpen}>
                <div>
                  <strong>Order #{order.id.slice(0, 8).toUpperCase()}</strong>
                  <span>{formatDate(order.created_at)} · {order.order_items.length} item{order.order_items.length === 1 ? '' : 's'}</span>
                </div>
                <StatusBadge status={order.status} />
                <strong>{formatPrice(order.total)}</strong>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {isOpen && <OrderDetails order={order} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
