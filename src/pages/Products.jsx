import { useSearchParams } from 'react-router-dom'
import { PackageSearch, RotateCcw } from 'lucide-react'
import useCatalog from '../hooks/useCatalog'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import { EmptyState, ErrorMessage, Loader } from '../components/Feedback'
import useUrlParam from '../hooks/useUrlParam'
import { getFinalPrice } from '../utils/helpers'

export default function Products() {
  const { products, categories, loading, error } = useCatalog()

  // The filters live in the URL (?search=...&category=...), so links like
  // "/products?category=fashion" work and the page can be shared or refreshed.
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  // Text inputs use a hook that keeps typing smooth and syncs the URL after a short pause.
  const [search, setSearch] = useUrlParam('search')
  const [minPrice, setMinPrice] = useUrlParam('min')
  const [maxPrice, setMaxPrice] = useUrlParam('max')
  const sort = searchParams.get('sort') || 'featured'

  // Updates ONE filter (used by the dropdowns) and keeps the others. An empty value removes it.
  function updateFilter(name, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(name, value)
    else next.delete(name)
    setSearchParams(next, { replace: true })
  }

  function resetFilters() {
    setSearchParams({})
  }

  // 1) Filter
  const filtered = products.filter((product) => {
    const price = getFinalPrice(product)
    const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase())
    const matchesCategory = !category || product.category?.slug === category
    const matchesMin = minPrice === '' || price >= Number(minPrice)
    const matchesMax = maxPrice === '' || price <= Number(maxPrice)
    return matchesSearch && matchesCategory && matchesMin && matchesMax
  })

  // 2) Sort (a copy, so the original list is not changed)
  const visibleProducts = [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return getFinalPrice(a) - getFinalPrice(b)
    if (sort === 'price-desc') return getFinalPrice(b) - getFinalPrice(a)
    if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at)
    if (sort === 'rating') return b.rating - a.rating
    return b.sales_count - a.sales_count // "featured" = most popular
  })

  const hasFilters = search || category || minPrice || maxPrice || sort !== 'featured'

  return (
    <div className="container section">
      <div className="page-title">
        <h1>{category ? categories.find((c) => c.slug === category)?.name || 'Products' : 'All products'}</h1>
        <p>{loading ? 'Loading...' : `${visibleProducts.length} product${visibleProducts.length === 1 ? '' : 's'} found`}</p>
      </div>

      <div className="filters">
        <SearchBar value={search} onChange={setSearch} />

        <select value={category} onChange={(event) => updateFilter('category', event.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>{item.name}</option>
          ))}
        </select>

        <div className="price-range">
          <input
            type="number"
            min="0"
            placeholder="Min $"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            aria-label="Minimum price"
          />
          <span>–</span>
          <input
            type="number"
            min="0"
            placeholder="Max $"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            aria-label="Maximum price"
          />
        </div>

        <select value={sort} onChange={(event) => updateFilter('sort', event.target.value)} aria-label="Sort by">
          <option value="featured">Sort: Popular</option>
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>

        {hasFilters && (
          <button type="button" className="btn btn-outline btn-small" onClick={resetFilters}>
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </div>

      {loading && <Loader text="Loading products..." />}
      <ErrorMessage message={error} />

      {!loading && !error && visibleProducts.length === 0 && (
        <EmptyState
          icon={PackageSearch}
          title="No products found"
          text="Try changing your search or filters."
        />
      )}

      <div className="product-grid">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
