import { supabase, SETUP_MESSAGE } from './supabase'
import { demoCategories, demoProducts } from './demoData'
import { makeSlug } from './helpers'

// Every function here either returns data or throws an Error with a readable message.
// Pages catch the error and show it to the user.

function requireSupabase() {
  if (!supabase) throw new Error(SETUP_MESSAGE)
  return supabase
}

// ---------------------------------------------------------------- READ

export async function getCategories() {
  if (!supabase) return demoCategories
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function getProducts() {
  if (!supabase) return demoProducts
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

// Adds a "category" object to demo products so they look the same as database products.
export function attachCategory(product, categories) {
  if (product.category) return product
  const category = categories.find((c) => c.id === product.category_id)
  return { ...product, category: category || null }
}

// ---------------------------------------------------------------- ADMIN: products

export async function uploadProductImage(file) {
  const client = requireSupabase()
  const extension = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
  const { error } = await client.storage.from('product-images').upload(fileName, file)
  if (error) throw new Error(error.message)
  return client.storage.from('product-images').getPublicUrl(fileName).data.publicUrl
}

export async function createProduct(product) {
  const { error } = await requireSupabase().from('products').insert(product)
  if (error) throw new Error(error.message)
}

export async function updateProduct(id, changes) {
  const { error } = await requireSupabase().from('products').update(changes).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteProduct(id) {
  const { error } = await requireSupabase().from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------- ADMIN: categories

export async function createCategory({ name, description }) {
  const { error } = await requireSupabase()
    .from('categories')
    .insert({ name, description, slug: makeSlug(name) })
  if (error) throw new Error(error.message)
}

export async function updateCategory(id, { name, description }) {
  const { error } = await requireSupabase()
    .from('categories')
    .update({ name, description, slug: makeSlug(name) })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteCategory(id) {
  const { error } = await requireSupabase().from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------- FAVORITES

export async function getFavoriteIds(userId) {
  const { data, error } = await requireSupabase()
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  return data.map((row) => row.product_id)
}

export async function addFavorite(userId, productId) {
  const { error } = await requireSupabase()
    .from('favorites')
    .insert({ user_id: userId, product_id: productId })
  if (error) throw new Error(error.message)
}

export async function removeFavorite(userId, productId) {
  const { error } = await requireSupabase()
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  if (error) throw new Error(error.message)
}
