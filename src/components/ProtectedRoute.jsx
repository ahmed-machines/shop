import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader } from './Feedback'

// Wraps pages that need a logged-in user (and optionally an admin).
// NOTE: this only improves the user experience. Real security comes from the
// Supabase Row Level Security policies in supabase/02_policies.sql.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader text="Checking your account..." />

  if (!user) {
    // Remember where the user wanted to go so we can send them back after login.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />

  return children
}

