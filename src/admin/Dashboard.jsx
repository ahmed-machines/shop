import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react'
import { getDashboardStats } from '../services/orderService'
import { ErrorMessage, Loader } from '../components/Feedback'
import { StatusBadge } from '../components/OrderDetails'
import { formatDate, formatPrice } from '../services/helpers'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboardStats().then(setStats).catch((err) => setError(err.message))
  }, [])

  const cards = stats && [
    { label: 'Total products', value: stats.totalProducts, icon: Package, color: 'purple' },
    { label: 'Total orders', value: stats.totalOrders, icon: ShoppingBag, color: 'blue' },
    { label: 'Total customers', value: stats.totalCustomers, icon: Users, color: 'orange' },
    { label: 'Total sales', value: formatPrice(stats.totalSales), icon: DollarSign, color: 'green' },
  ]

  return (
    <>
      <div className="admin-title">
        <h1>Dashboard</h1>
        <p>A quick overview of your store.</p>
      </div>

      <ErrorMessage message={error} />
      {!stats && !error && <Loader />}

      {stats && (
        <>
          <div className="stat-grid">
            {cards.map(({ label, value, icon: Icon, color }) => (
              <div className="stat-card" key={label}>
                <div className={`stat-icon ${color}`}><Icon size={22} /></div>
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Recent orders</h2>
              <Link to="/admin/orders" className="link-arrow">View all</Link>
            </div>
            {stats.recentOrders.length === 0 ? (
              <p className="muted">No orders yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td>{order.customer_name}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td><StatusBadge status={order.status} /></td>
                        <td>{formatPrice(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

