import { useEffect, useState } from 'react'
import { attachCategory, getCategories, getProducts } from '../services/productService'

// Custom hook: loads all products and categories once and reports loading / error state.
// Pages that need the catalog just call useCatalog().
export default function useCatalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false // prevents setting state after the component has been removed

    async function load() {
      try {
        const [productList, categoryList] = await Promise.all([getProducts(), getCategories()])
        if (cancelled) return
        setProducts(productList.map((product) => attachCategory(product, categoryList)))
        setCategories(categoryList)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { products, categories, loading, error }
}

