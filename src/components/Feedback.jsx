// Small shared UI pieces: loading spinner, error box, empty state, setup notice.
import { AlertCircle, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured, SETUP_MESSAGE } from '../services/supabase'

export function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader" role="status">
      <Loader2 className="spin" size={32} />
      <span>{text}</span>
    </div>
  )
}

export function ErrorMessage({ message }) {
  if (!message) return null
  return (
    <div className="alert alert-error" role="alert">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, text, actionLabel, actionTo }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={48} />}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {actionLabel && (
        <Link to={actionTo} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

// Shown on pages that need a database when the .env file has not been filled in.
export function SetupNotice() {
  if (isSupabaseConfigured) return null
  return (
    <div className="alert alert-warning" role="alert">
      <AlertCircle size={18} />
      <span>{SETUP_MESSAGE}</span>
    </div>
  )
}

