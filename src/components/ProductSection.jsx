import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from './ProductCard'

// A titled row of product cards. Used 3 times on the home page.
export default function ProductSection({ title, subtitle, products, linkTo }) {
  if (products.length === 0) return null
  return (
    <section className="section container">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {linkTo && (
          <Link to={linkTo} className="link-arrow">
            View all <ArrowRight size={16} />
          </Link>
        )}
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

