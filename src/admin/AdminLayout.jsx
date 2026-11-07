import logo from '../assets/logo.svg'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ExternalLink, LayoutDashboard, LogOut, Package, ShoppingBag, Tags } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { SetupNotice } from '../components/Feedback'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
]

// Separate layout for the admin area: dark sidebar + content.
export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <div className="logo logo-light">
          <img src={logo} alt="" className="logo-mark" />
          Shop<span>Sphere</span>
        </div>
        <span className="admin-label">Admin panel</span>

        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <NavLink to="/"><ExternalLink size={18} /> View store</NavLink>
          <button type="button" onClick={handleLogout}><LogOut size={18} /> Log out</button>
          <small>{user.email}</small>
        </div>
      </aside>

      <section className="admin-content">
        <SetupNotice />
        <Outlet />
      </section>
    </div>
  )
}

