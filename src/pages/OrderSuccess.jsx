import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { getOrderById } from '../services/orderService'
import { ErrorMessage, Loader } from '../components/Feedback'
import OrderDetails from '../components/OrderDetails'

export default function OrderSuccess() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getOrderById(orderId).then(setOrder).catch((err) => setError(err.message))
  }, [orderId])

  return (
    <div className="container section narrow">
      <div className="success-box">
        <CheckCircle2 size={64} />
        <h1>Thank you! Your order is confirmed</h1>
        <p>
          We received your order and will contact you soon. You will pay <strong>cash on delivery</strong>.
        </p>
        {order && <p className="order-number">Order #{order.id.slice(0, 8).toUpperCase()}</p>}
      </div>

      <ErrorMessage message={error} />
      {!order && !error && <Loader text="Loading your order..." />}
      {order && <OrderDetails order={order} />}

      <div className="center-actions">
        <Link to="/my-orders" className="btn btn-primary">View my orders</Link>
        <Link to="/products" className="btn btn-outline">Continue shopping</Link>
      </div>
    </div>
  )
}
