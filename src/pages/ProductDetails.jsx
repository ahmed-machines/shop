import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Heart, Minus, PackageX, Plus, RotateCcw, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import useCatalog from '../hooks/useCatalog'
import ProductCard from '../components/ProductCard'
import Rating from '../components/Rating'
import { EmptyState, ErrorMessage, Loader } from '../components/Feedback'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useToast } from '../context/ToastContext'
import { FALLBACK_IMAGE, formatPrice, getFinalPrice } from '../services/helpers'

export default function ProductDetails() {
  const { id } = useParams() // the :id part of the URL
  const navigate = useNavigate()
  const { products, loading, error } = useCatalog()
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { showToast } = useToast()
  const [quantity, setQuantity] = useState(1)

  // When we move to another product (e.g. a related one) start again from quantity 1.
  useEffect(() => {
    setQuantity(1)
  }, [id])

  if (loading) return <Loader text="Loading product..." />
  if (error) return <div className="container section"><ErrorMessage message={error} /></div>

  const product = products.find((item) => item.id === id)
  if (!product) {
    return (
      <div className="container section">
        <EmptyState icon={PackageX} title="Product not found" text="This product may have been removed." actionLabel="Browse products" actionTo="/products" />
      </div>
    )
  }

  const finalPrice = getFinalPrice(product)
  const hasDiscount = product.discount_percent > 0
  const outOfStock = product.stock === 0
  const favorite = isFavorite(product.id)
  const relatedProducts = products
    .filter((item) => item.category_id === product.category_id && item.id !== product.id)
    .slice(0, 4)

  function handleAddToCart() {
    addToCart(product, quantity)
    showToast(`${quantity} × ${product.name} added to cart`)
  }

  async function handleFavorite() {
    const done = await toggleFavorite(product.id)
    if (!done) {
      showToast('Please log in to save favorites', 'error')
      navigate('/login', { state: { from: `/products/${product.id}` } })
    }
  }

  return (
    <div className="container section">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <ChevronRight size={14} />
        <Link to="/products">Shop</Link> <ChevronRight size={14} />
        {product.category && (
          <>
            <Link to={`/products?category=${product.category.slug}`}>{product.category.name}</Link>
            <ChevronRight size={14} />
          </>
        )}
        <span>{product.name}</span>
      </nav>

      <div className="details">
        <div className="details-image">
          <img
            src={product.image_url}
            alt={product.name}
            onError={(event) => (event.currentTarget.src = FALLBACK_IMAGE)}
          />
          {hasDiscount && <span className="badge badge-sale">-{product.discount_percent}%</span>}
        </div>

        <div className="details-info">
          <span className="product-card-category">{product.category?.name || 'General'}</span>
          <h1>{product.name}</h1>
          <Rating value={product.rating} />

          <div className="price price-large">
            <span className="price-current">{formatPrice(finalPrice)}</span>
            {hasDiscount && <span className="price-old">{formatPrice(product.price)}</span>}
          </div>

          <p className="details-description">{product.description}</p>

          <p className={`stock ${outOfStock ? 'stock-out' : product.stock <= 10 ? 'stock-low' : 'stock-in'}`}>
            {outOfStock ? 'Out of stock' : product.stock <= 10 ? `Only ${product.stock} left in stock` : `In stock (${product.stock} available)`}
          </p>

          <div className="details-actions">
            <div className="quantity-selector">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock} aria-label="Increase quantity">
                <Plus size={16} />
              </button>
            </div>

            <button type="button" className="btn btn-primary btn-large" onClick={handleAddToCart} disabled={outOfStock}>
              <ShoppingCart size={18} /> Add to cart
            </button>

            <button
              type="button"
              className={`btn btn-outline btn-large favorite-toggle ${favorite ? 'active' : ''}`}
              onClick={handleFavorite}
            >
              <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
              {favorite ? 'Saved' : 'Favorite'}
            </button>
          </div>

          <ul className="details-perks">
            <li><Truck size={18} /> Free shipping on orders over $100</li>
            <li><RotateCcw size={18} /> 30-day easy returns</li>
            <li><ShieldCheck size={18} /> Cash on delivery available</li>
          </ul>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="related">
          <div className="section-header"><h2>Related products</h2></div>
          <div className="product-grid">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
