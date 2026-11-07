import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Banknote, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { placeOrder } from '../services/orderService'
import FormField from '../components/FormField'
import OrderSummary from '../components/OrderSummary'
import { EmptyState, ErrorMessage, SetupNotice } from '../components/Feedback'
import { formatPrice } from '../utils/helpers'

export default function Checkout() {
  const { user, profile } = useAuth()
  const { items, subtotal, shipping, total, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill the form with the details saved in the customer's profile.
  useEffect(() => {
    if (profile) {
      setForm((current) => ({
        ...current,
        fullName: current.fullName || profile.full_name || '',
        phone: current.phone || profile.phone || '',
        address: current.address || profile.address || '',
        city: current.city || profile.city || '',
      }))
    }
  }, [profile])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function validate() {
    const newErrors = {}
    if (form.fullName.trim().length < 2) newErrors.fullName = 'Enter your full name'
    if (!/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) newErrors.phone = 'Enter a valid phone number'
    if (form.address.trim().length < 5) newErrors.address = 'Enter your street address'
    if (form.city.trim().length < 2) newErrors.city = 'Enter your city'
    return newErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSubmitting(true)
    setServerError('')
    try {
      const orderId = await placeOrder(
        {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          notes: form.notes.trim(),
        },
        items,
      )
      navigate(`/order-success/${orderId}`, { replace: true })
      clearCart()
    } catch (error) {
      setServerError(error.message)
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container section">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" text="Add some products before checking out." actionLabel="Start shopping" actionTo="/products" />
      </div>
    )
  }

  return (
    <div className="container section">
      <div className="page-title">
        <h1>Checkout</h1>
        <p>Ordering as {user.email}</p>
      </div>

      <SetupNotice />

      <div className="cart-layout">
        <form className="card checkout-form" onSubmit={handleSubmit} noValidate>
          <h2>Customer &amp; shipping details</h2>
          <ErrorMessage message={serverError} />

          <div className="form-grid">
            <FormField label="Full name" id="fullName" autoComplete="name" value={form.fullName} onChange={handleChange} error={errors.fullName} />
            <FormField label="Phone number" id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} error={errors.phone} />
          </div>
          <FormField label="Street address" id="address" autoComplete="street-address" value={form.address} onChange={handleChange} error={errors.address} />
          <FormField label="City" id="city" autoComplete="address-level2" value={form.city} onChange={handleChange} error={errors.city} />
          <FormField label="Order notes (optional)" id="notes" as="textarea" rows="3" value={form.notes} onChange={handleChange} />

          <h2>Payment method</h2>
          <label className="payment-option">
            <input type="radio" checked readOnly />
            <Banknote size={22} />
            <div>
              <strong>Cash on delivery</strong>
              <span>Pay when your order arrives. This is a demo store – no card payments are processed.</span>
            </div>
          </label>

          <button type="submit" className="btn btn-primary btn-large btn-block" disabled={submitting}>
            {submitting ? 'Placing order...' : `Confirm order · ${formatPrice(total)}`}
          </button>
          <Link to="/cart" className="continue-link">Back to cart</Link>
        </form>

        <OrderSummary subtotal={subtotal} shipping={shipping} total={total}>
          <ul className="summary-items">
            {items.map((item) => (
              <li key={item.id}>
                <span>{item.quantity} × {item.name}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </OrderSummary>
      </div>
    </div>
  )
}

