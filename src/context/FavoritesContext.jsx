import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { addFavorite, getFavoriteIds, removeFavorite } from '../services/productService'
import { useToast } from './ToastContext'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [favoriteIds, setFavoriteIds] = useState([])

  // Load the favorites whenever the logged-in user changes.
  useEffect(() => {
    if (!user) {
      setFavoriteIds([])
      return
    }
    getFavoriteIds(user.id)
      .then(setFavoriteIds)
      .catch(() => setFavoriteIds([]))
  }, [user])

  const isFavorite = useCallback((productId) => favoriteIds.includes(productId), [favoriteIds])

  // Returns false when the user is not logged in so the caller can redirect to login.
  async function toggleFavorite(productId) {
    if (!user) return false
    try {
      if (favoriteIds.includes(productId)) {
        await removeFavorite(user.id, productId)
        setFavoriteIds((ids) => ids.filter((id) => id !== productId))
        showToast('Removed from favorites')
      } else {
        await addFavorite(user.id, productId)
        setFavoriteIds((ids) => [...ids, productId])
        showToast('Added to favorites')
      }
    } catch (error) {
      showToast(error.message, 'error')
    }
    return true
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites must be used inside <FavoritesProvider>')
  return context
}

