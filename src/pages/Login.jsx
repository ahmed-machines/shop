import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import FormField, { isValidEmail } from '../components/FormField'
import { ErrorMessage, SetupNotice } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { user, login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/' // where to go after login

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Already logged in? Skip the form.
  if (user) return <Navigate to={redirectTo} replace />

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function validate() {
    const newErrors = {}
    if (!isValidEmail(form.email)) newErrors.email = 'Enter a valid email address'
    if (!form.password) newErrors.password = 'Enter your password'
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
      await login(form.email, form.password)
      showToast('Welcome back!')
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setServerError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <div className="auth-icon"><LogIn size={26} /></div>
        <h1>Welcome back</h1>
        <p>Log in to see your orders and checkout faster.</p>

        <SetupNotice />
        <ErrorMessage message={serverError} />

        <FormField label="Email" id="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} />
        <FormField label="Password" id="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} error={errors.password} />

        <button type="submit" className="btn btn-primary btn-large btn-block" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>

        <p className="auth-switch">
          New to ShopSphere? <Link to="/register" state={location.state}>Create an account</Link>
        </p>
      </form>
    </div>
  )
}

