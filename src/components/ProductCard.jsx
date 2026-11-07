import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import Rating from './Rating'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FALLBACK_IMAGE, formatPrice, getFinalPrice } from '../services/helpers'

// One reusable card, used on the home page, products page and related products.
export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const finalPrice = getFinalPrice(product)
  const hasDiscount = product.discount_percent > 0
  const outOfStock = product.stock === 0
  const favorite = isFavorite(product.id)

  function handleAddToCart() {
    addToCart(product, 1)
    showToast(`${product.name} added to cart`)
  }

  async function handleFavorite() {
    const done = await toggleFavorite(product.id)
    if (!done) {
      showToast('Please log in to save favorites', 'error')
      navigate('/login')
    }
  }

  return (
    <article className="product-card">
      <div className="product-card-image">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={(event) => (event.currentTarget.src = FALLBACK_IMAGE)}
          />
        </Link>
        {hasDiscount && <span className="badge badge-sale">-{product.discount_percent}%</span>}
        {outOfStock && <span className="badge badge-dark">Sold out</span>}
        <button
          type="button"
          className={`icon-button favorite-button ${favorite ? 'active' : ''}`}
          onClick={handleFavorite}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="product-card-body">
        <span className="product-card-category">{product.category?.name || 'General'}</span>
        <Link to={`/products/${product.id}`} className="product-card-title">
          {product.name}
        </Link>
        <Rating value={product.rating} />

        <div className="product-card-footer">
          <div className="price">
            <span className="price-current">{formatPrice(finalPrice)}</span>
            {hasDiscount && <span className="price-old">{formatPrice(product.price)}</span>}
          </div>
          <button
            type="button"
            className="icon-button cart-button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </article>
  )
}

