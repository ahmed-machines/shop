import { createContext, useContext, useState } from 'react'

// A tiny notification ("toast") system: showToast('Saved!') displays a message for 3 seconds.
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    const id = Date.now()
    setToast({ id, message, type })
    // Hide it after 3 seconds (only if a newer toast has not replaced it).
    setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}

