import { supabase, SETUP_MESSAGE } from './supabase'

function requireSupabase() {
  if (!supabase) throw new Error(SETUP_MESSAGE)
  return supabase
}

// ---------------------------------------------------------------- CUSTOMER

// Calls the place_order SQL function. The server checks stock and recalculates prices,
// so the browser cannot cheat. Returns the new order id.
export async function placeOrder(customer, cartItems) {
  const items = cartItems.map((item) => ({ product_id: item.id, quantity: item.quantity }))
  const { data, error } = await requireSupabase().rpc('place_order', {
    p_customer_name: customer.fullName,
    p_phone: customer.phone,
    p_shipping_address: customer.address,
    p_city: customer.city,
    p_notes: customer.notes || null,
    p_items: items,
  })
  if (error) throw new Error(error.message)
  return data
}

// Row Level Security makes sure a customer only ever receives their own orders.
export async function getMyOrders(userId) {
  const { data, error } = await requireSupabase()
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getOrderById(orderId) {
  const { data, error } = await requireSupabase()
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Order not found')
  return data
}

// ---------------------------------------------------------------- ADMIN

export async function getAllOrders() {
  const { data, error } = await requireSupabase()
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function updateOrderStatus(orderId, status) {
  const { error } = await requireSupabase().from('orders').update({ status }).eq('id', orderId)
  if (error) throw new Error(error.message)
}

export async function getDashboardStats() {
  const client = requireSupabase()
  const [products, customers, orders] = await Promise.all([
    client.from('products').select('*', { count: 'exact', head: true }),
    client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    client.from('orders').select('id, total, status, customer_name, created_at').order('created_at', { ascending: false }),
  ])
  const failed = products.error || customers.error || orders.error
  if (failed) throw new Error(failed.message)

  // Cancelled orders do not count as sales.
  const totalSales = orders.data
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + Number(order.total), 0)

  return {
    totalProducts: products.count,
    totalCustomers: customers.count,
    totalOrders: orders.data.length,
    totalSales,
    recentOrders: orders.data.slice(0, 6),
  }
}

// ---------------------------------------------------------------- PROFILE

export async function getProfile(userId) {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function updateProfile(userId, changes) {
  const { error } = await requireSupabase().from('profiles').update(changes).eq('id', userId)
  if (error) throw new Error(error.message)
}

