import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Headphones, Mail, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import useCatalog from '../hooks/useCatalog'
import ProductSection from '../components/ProductSection'
import { ErrorMessage, Loader } from '../components/Feedback'
import { useToast } from '../context/ToastContext'

const perks = [
  { icon: Truck, title: 'Free shipping', text: 'On all orders over $100' },
  { icon: RotateCcw, title: '30-day returns', text: 'Changed your mind? No problem' },
  { icon: ShieldCheck, title: 'Secure shopping', text: 'Your data is always protected' },
  { icon: Headphones, title: 'Friendly support', text: 'We are here 7 days a week' },
]

function Newsletter() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const { showToast } = useToast()

  function handleSubmit(event) {
    event.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setError('')
    setEmail('')
    // Demo only: the address is not stored anywhere.
    showToast('Thanks for subscribing!')
  }

  return (
    <section className="container section">
      <div className="newsletter">
        <Mail size={36} />
        <h2>Get 10% off your first order</h2>
        <p>Join our newsletter for new arrivals, exclusive deals and style tips.</p>
        <form onSubmit={handleSubmit} noValidate>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-label="Email address"
          />
          <button type="submit" className="btn btn-light">Subscribe</button>
        </form>
        {error && <small className="newsletter-error">{error}</small>}
      </div>
    </section>
  )
}

export default function Home() {
  const { products, categories, loading, error } = useCatalog()

  // sort() changes the array, so we copy it first with [...products].
  const bestSellers = [...products].sort((a, b) => b.sales_count - a.sales_count).slice(0, 4)
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4)
  const recommended = [...products].sort((a, b) => b.rating - a.rating)
    .filter((product) => !bestSellers.includes(product) && !newArrivals.includes(product))
    .slice(0, 4)

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-tag">New season collection</span>
            <h1>Shop smarter.<br />Live better.</h1>
            <p>
              Discover premium electronics, fashion, home essentials and more – carefully
              selected, fairly priced and delivered to your door.
            </p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary btn-large">
                Shop now <ArrowRight size={18} />
              </Link>
              <Link to="/products?sort=newest" className="btn btn-light-outline btn-large">
                New arrivals
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&h=800&q=80"
              alt="Shopping bags and products"
            />
          </div>
        </div>
      </section>

      {/* ---------- Perks ---------- */}
      <section className="container perks">
        {perks.map(({ icon: Icon, title, text }) => (
          <div className="perk" key={title}>
            <Icon size={26} />
            <div>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          </div>
        ))}
      </section>

      {loading && <Loader text="Loading products..." />}
      {error && <div className="container"><ErrorMessage message={error} /></div>}

      {!loading && !error && (
        <>
          {/* ---------- Featured categories ---------- */}
          <section className="section container">
            <div className="section-header">
              <div>
                <h2>Shop by category</h2>
                <p>Find exactly what you are looking for</p>
              </div>
            </div>
            <div className="category-grid">
              {categories.map((category) => (
                <Link to={`/products?category=${category.slug}`} className="category-card" key={category.id}>
                  <img src={category.image_url} alt="" loading="lazy" />
                  <div className="category-card-overlay">
                    <h3>{category.name}</h3>
                    <span>Explore <ArrowRight size={14} /></span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ---------- Promotional banners ---------- */}
          <section className="container promo-grid">
            <Link to="/products?category=electronics" className="promo promo-purple">
              <span className="promo-tag">Up to 25% off</span>
              <h3>Smart tech deals</h3>
              <p>Headphones, earbuds and speakers for less.</p>
              <span className="link-arrow">Shop electronics <ArrowRight size={16} /></span>
            </Link>
            <Link to="/products?category=fashion" className="promo promo-orange">
              <span className="promo-tag">Winter essentials</span>
              <h3>Fashion up to 30% off</h3>
              <p>Jackets, sneakers and everyday style.</p>
              <span className="link-arrow">Shop fashion <ArrowRight size={16} /></span>
            </Link>
            <Link to="/products?category=home-living" className="promo promo-green">
              <span className="promo-tag">Free shipping over $100</span>
              <h3>Refresh your home</h3>
              <p>Lighting, decor and comfort pieces.</p>
              <span className="link-arrow">Shop home <ArrowRight size={16} /></span>
            </Link>
          </section>

          <ProductSection title="Best sellers" subtitle="Our customers' favorites" products={bestSellers} linkTo="/products" />
          <ProductSection title="New arrivals" subtitle="Fresh in this week" products={newArrivals} linkTo="/products?sort=newest" />
          <ProductSection title="Recommended for you" subtitle="Top rated picks" products={recommended} linkTo="/products" />
        </>
      )}

      <Newsletter />
    </>
  )
}
