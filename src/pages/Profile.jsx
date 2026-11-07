import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { useToast } from '../context/ToastContext'
import { updateProfile } from '../services/orderService'
import useCatalog from '../hooks/useCatalog'
import FormField from '../components/FormField'
import ProductCard from '../components/ProductCard'
import { ErrorMessage, SetupNotice } from '../components/Feedback'

export default function Profile() {
  const { user, profile, isAdmin, refreshProfile, logout } = useAuth()
  const { favoriteIds } = useFavorites()
  const { products } = useCatalog()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  // Fill the form when the profile has loaded.
  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
      })
    }
  }, [profile])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const newErrors = {}
    if (form.fullName.trim().length < 2) newErrors.fullName = 'Enter your full name'
    if (form.phone && !/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) newErrors.phone = 'Enter a valid phone number'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSaving(true)
    setServerError('')
    try {
      await updateProfile(user.id, {
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
      })
      await refreshProfile()
      showToast('Profile saved')
    } catch (error) {
      setServerError(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const favoriteProducts = products.filter((product) => favoriteIds.includes(product.id))

  return (
    <div className="container section">
      <div className="page-title">
        <h1>My profile</h1>
        <p>Manage your details and saved products.</p>
      </div>

      <SetupNotice />

      <div className="profile-layout">
        <form className="card" onSubmit={handleSubmit} noValidate>
          <div className="profile-header">
            <div className="avatar">{(form.fullName || user.email)[0].toUpperCase()}</div>
            <div>
              <strong>{user.email}</strong>
              <span className="role-tag">{isAdmin ? <><Shield size={13} /> Administrator</> : 'Customer'}</span>
            </div>
          </div>

          <ErrorMessage message={serverError} />
          <FormField label="Full name" id="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} />
          <FormField label="Phone" id="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} />
          <FormField label="Address" id="address" value={form.address} onChange={handleChange} />
          <FormField label="City" id="city" value={form.city} onChange={handleChange} />

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" className="btn btn-outline" onClick={handleLogout}>
              <LogOut size={16} /> Log out
            </button>
          </div>
        </form>

        <section>
          <h2 className="subheading"><Heart size={20} /> My favorites</h2>
          {favoriteProducts.length === 0 ? (
            <p className="muted">You have not saved any products yet. Tap the heart on a product to save it.</p>
          ) : (
            <div className="product-grid two-columns">
              {favoriteProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

