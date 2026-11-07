import { Search, X } from 'lucide-react'

// A controlled input: the parent owns the text (value) and receives changes (onChange).
export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search products...' }) {
  function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    if (onSubmit) onSubmit()
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <Search size={18} className="search-icon" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
      />
      {value && (
        <button type="button" className="search-clear" onClick={() => onChange('')} aria-label="Clear search">
          <X size={16} />
        </button>
      )}
    </form>
  )
}

