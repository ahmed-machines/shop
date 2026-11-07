import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import FormField, { isValidEmail } from '../components/FormField'
import { ErrorMessage, SetupNotice } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const { user, register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={redirectTo} replace />

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function validate() {
    const newErrors = {}
    if (form.fullName.trim().length < 2) newErrors.fullName = 'Enter your full name'
    if (!isValidEmail(form.email)) newErrors.email = 'Enter a valid email address'
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (form.confirmPassword !== form.password) newErrors.confirmPassword = 'Passwords do not match'
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
      const result = await register(form.fullName.trim(), form.email, form.password)
      if (result.needsEmailConfirmation) {
        setConfirmationSent(true) // Supabase sent a confirmation email
      } else {
        showToast('Account created. Welcome to ShopSphere!')
        navigate(redirectTo, { replace: true })
      }
    } catch (error) {
      setServerError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmationSent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-icon"><UserPlus size={26} /></div>
          <h1>Check your email</h1>
          <p>We sent a confirmation link to <strong>{form.email}</strong>. Click it, then log in.</p>
          <Link to="/login" className="btn btn-primary btn-large btn-block">Go to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="auth-icon"><UserPlus size={26} /></div>
        <h1>Create your account</h1>
        <p>Join ShopSphere to track orders and save favorites.</p>

        <SetupNotice />
        <ErrorMessage message={serverError} />

        <FormField label="Full name" id="fullName" autoComplete="name" value={form.fullName} onChange={handleChange} error={errors.fullName} />
        <FormField label="Email" id="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} />
        <FormField label="Password" id="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} error={errors.password} />
        <FormField label="Confirm password" id="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />

        <button type="submit" className="btn btn-primary btn-large btn-block" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login" state={location.state}>Log in</Link>
        </p>
      </form>
    </div>
  )
}

