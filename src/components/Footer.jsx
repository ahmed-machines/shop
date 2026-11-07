import { Link } from 'react-router-dom'
import { Globe, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo logo-light">
            <span className="logo-mark">
              <Globe size={20} />
            </span>
            Shop<span>Sphere</span>
          </Link>
          <p>Quality products, fair prices and fast delivery. Your world of shopping in one place.</p>
        </div>

        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/products">All products</Link></li>
            <li><Link to="/products?sort=newest">New arrivals</Link></li>
            <li><Link to="/cart">Shopping cart</Link></li>
            <li><Link to="/my-orders">My orders</Link></li>
          </ul>
        </div>

        <div>
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Log in</Link></li>
            <li><Link to="/register">Create account</Link></li>
            <li><Link to="/profile">My profile</Link></li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul className="footer-contact">
            <li><MapPin size={16} /> 12 Market Street, Riyadh</li>
            <li><Phone size={16} /> +966 11 000 0000</li>
            <li><Mail size={16} /> hello@shopsphere.example</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <span>© {new Date().getFullYear()} ShopSphere. A portfolio demo project – no real payments are processed.</span>
        </div>
      </div>
    </footer>
  )
}

