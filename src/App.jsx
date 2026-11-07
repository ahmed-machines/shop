import { useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { EmptyState } from './components/Feedback'
import { SearchX } from 'lucide-react'

import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import MyOrders from './pages/MyOrders'

import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import ProductsManager from './admin/ProductsManager'
import OrdersManager from './admin/OrdersManager'
import CategoriesManager from './admin/CategoriesManager'

// Layout for customer pages: navbar on top, footer at the bottom, page in the middle.
function StoreLayout() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

// Scrolls to the top every time the URL path changes.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function NotFound() {
  return (
    <div className="container section">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        text="The page you are looking for does not exist."
        actionLabel="Back to home"
        actionTo="/"
      />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Pages that need a logged-in customer */}
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success/:orderId" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin area: separate layout, administrators only */}
        <Route
          path="/admin"
          element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsManager />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="categories" element={<CategoriesManager />} />
        </Route>
      </Routes>
    </>
  )
}
