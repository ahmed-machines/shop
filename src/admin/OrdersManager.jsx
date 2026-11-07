import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getAllOrders, updateOrderStatus } from '../services/orderService'
import { useToast } from '../context/ToastContext'
import SearchBar from '../components/SearchBar'
import OrderDetails, { StatusBadge } from '../components/OrderDetails'
import { ErrorMessage, Loader } from '../components/Feedback'
import { ORDER_STATUSES, formatDate, formatPrice } from '../utils/helpers'

export default function OrdersManager() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [openOrderId, setOpenOrderId] = useState(null)

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatusChange(orderId, status) {
    try {
      await updateOrderStatus(orderId, status)
      // Update only that order in the list, without reloading everything.
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)))
      showToast(`Order marked as ${status}`)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const query = search.trim().toLowerCase()
  const visibleOrders = orders.filter((order) => {
    const matchesSearch =
      !query ||
      order.id.toLowerCase().includes(query) ||
      order.customer_name.toLowerCase().includes(query) ||
      order.phone.includes(query)
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <div className="admin-title">
        <h1>Orders</h1>
        <p>{orders.length} orders in total.</p>
      </div>

      <div className="card">
        <div className="card-header filters-inline">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by order ID, name or phone..." />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <ErrorMessage message={error} />
        {loading && <Loader />}

        {!loading && !error && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th></th><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {visibleOrders.map((order) => {
                  const isOpen = openOrderId === order.id
                  return (
                    <FragmentRow key={order.id} isOpen={isOpen} details={<OrderDetails order={order} />}>
                      <td>
                        <button type="button" className="icon-button" onClick={() => setOpenOrderId(isOpen ? null : order.id)} aria-label="Toggle order details" aria-expanded={isOpen}>
                          {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                        </button>
                      </td>
                      <td>#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td>{order.customer_name}<br /><small className="muted">{order.phone}</small></td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>{formatPrice(order.total)}</td>
                      <td>
                        <select
                          className={`status-select status-${order.status}`}
                          value={order.status}
                          onChange={(event) => handleStatusChange(order.id, event.target.value)}
                          aria-label="Order status"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </FragmentRow>
                  )
                })}
                {visibleOrders.length === 0 && (
                  <tr><td colSpan="6" className="muted center">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

// One table row plus an optional "details" row underneath it.
function FragmentRow({ children, isOpen, details }) {
  return (
    <>
      <tr>{children}</tr>
      {isOpen && (
        <tr className="details-row">
          <td colSpan="6">{details}</td>
        </tr>
      )}
    </>
  )
}

