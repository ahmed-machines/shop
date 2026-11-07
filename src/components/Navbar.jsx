import { useState } from 'react'
import logo from '../assets/logo.svg'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu, ShoppingCart, User, X } from 'lucide-react'
import SearchBar from './SearchBar'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false) // mobile menu
  const [search, setSearch] = useState('')

  function closeMenu() {
    setMenuOpen(false)
  }

  function handleSearch() {
    // Go to the products page; the page reads "?search=" from the URL.
    navigate(`/products?search=${encodeURIComponent(search.trim())}`)
    setSearch('')
    closeMenu()
  }

  async function handleLogout() {
    await logout()
    closeMenu()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          <img src={logo} alt="" className="logo-mark" />
          Shop<span>Sphere</span>
        </Link>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <div className="nav-search-mobile">
            <SearchBar value={search} onChange={setSearch} onSubmit={handleSearch} />
          </div>
          <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
          <NavLink to="/products" onClick={closeMenu}>Shop</NavLink>
          {user && <NavLink to="/my-orders" onClick={closeMenu}>My Orders</NavLink>}
          {isAdmin && <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink>}
          {user && <button type="button" className="nav-logout" onClick={handleLogout}>Log out</button>}
        </nav>

        <div className="nav-search-desktop">
          <SearchBar value={search} onChange={setSearch} onSubmit={handleSearch} />
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/profile" className="icon-button" aria-label="My profile" title="My profile">
                <User size={20} />
              </Link>
              <button type="button" className="icon-button hide-mobile" onClick={handleLogout} aria-label="Log out" title="Log out">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-outline btn-small">Log in</Link>
          )}

          <Link to="/cart" className="icon-button cart-link" aria-label={`Cart with ${itemCount} items`}>
            <ShoppingCart size={20} />
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>

          <button
            type="button"
            className="icon-button menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  )
}
