import { useCallback, useEffect, useState } from 'react'
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  attachCategory,
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
  uploadProductImage,
} from '../services/productService'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import SearchBar from '../components/SearchBar'
import { ErrorMessage, Loader } from '../components/Feedback'
import { FALLBACK_IMAGE, formatPrice, getFinalPrice } from '../utils/helpers'

const emptyForm = {
  name: '', description: '', price: '', discount_percent: '0',
  category_id: '', stock: '', rating: '4.5', image_url: '',
}

// The add / edit form shown inside the modal.
function ProductForm({ product, categories, onSaved, onCancel }) {
  const { showToast } = useToast()
  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          description: product.description || '',
          price: String(product.price),
          discount_percent: String(product.discount_percent),
          category_id: product.category_id || '',
          stock: String(product.stock),
          rating: String(product.rating),
          image_url: product.image_url || '',
        }
      : emptyForm,
  )
  const [imageFile, setImageFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function handleFile(event) {
    const file = event.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'Please choose an image file' })
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image must be smaller than 3 MB' })
      return
    }
    setErrors({ ...errors, image: '' })
    setImageFile(file)
  }

  function validate() {
    const newErrors = {}
    if (form.name.trim().length < 2) newErrors.name = 'Enter a product name'
    if (form.price === '' || Number(form.price) < 0) newErrors.price = 'Enter a valid price'
    if (Number(form.discount_percent) < 0 || Number(form.discount_percent) > 90) newErrors.discount_percent = 'Discount must be between 0 and 90'
    if (form.stock === '' || Number(form.stock) < 0 || !Number.isInteger(Number(form.stock))) newErrors.stock = 'Enter a whole number'
    if (Number(form.rating) < 0 || Number(form.rating) > 5) newErrors.rating = 'Rating must be between 0 and 5'
    if (!form.category_id) newErrors.category_id = 'Choose a category'
    if (!imageFile && !form.image_url.trim()) newErrors.image = 'Upload an image or paste an image URL'
    return newErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSaving(true)
    setServerError('')
    try {
      // Upload first (if a file was chosen), then save the product with the image URL.
      const imageUrl = imageFile ? await uploadProductImage(imageFile) : form.image_url.trim()
      const data = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        discount_percent: Number(form.discount_percent) || 0,
        category_id: form.category_id,
        stock: Number(form.stock),
        rating: Number(form.rating),
        image_url: imageUrl,
      }
      if (product) await updateProduct(product.id, data)
      else await createProduct(data)
      showToast(product ? 'Product updated' : 'Product added')
      onSaved()
    } catch (error) {
      setServerError(error.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorMessage message={serverError} />
      <FormField label="Product name" id="name" value={form.name} onChange={handleChange} error={errors.name} />
      <FormField label="Description" id="description" as="textarea" rows="3" value={form.description} onChange={handleChange} />

      <div className="form-grid">
        <FormField label="Price ($)" id="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} error={errors.price} />
        <FormField label="Discount (%)" id="discount_percent" type="number" min="0" max="90" value={form.discount_percent} onChange={handleChange} error={errors.discount_percent} />
        <FormField label="Stock" id="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} error={errors.stock} />
        <FormField label="Rating (0-5)" id="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={handleChange} error={errors.rating} />
      </div>

      <FormField label="Category" id="category_id" as="select" value={form.category_id} onChange={handleChange} error={errors.category_id}>
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </FormField>

      <div className={`form-field ${errors.image ? 'has-error' : ''}`}>
        <label htmlFor="image-file">Product image</label>
        <div className="image-upload">
          <img
            src={imageFile ? URL.createObjectURL(imageFile) : form.image_url || FALLBACK_IMAGE}
            alt="Preview"
            onError={(event) => (event.currentTarget.src = FALLBACK_IMAGE)}
          />
          <div>
            <label className="btn btn-outline btn-small" htmlFor="image-file">
              <ImagePlus size={15} /> Upload image
            </label>
            <input id="image-file" type="file" accept="image/*" onChange={handleFile} hidden />
            {imageFile && <small className="muted"> {imageFile.name}</small>}
            <input
              type="url"
              name="image_url"
              placeholder="...or paste an image URL"
              value={form.image_url}
              onChange={(event) => { handleChange(event); setImageFile(null) }}
              aria-label="Image URL"
            />
          </div>
        </div>
        {errors.image && <small className="field-error">{errors.image}</small>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : product ? 'Save changes' : 'Add product'}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

export default function ProductsManager() {
  const { showToast } = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // null = closed, {} = new, product = edit

  const loadData = useCallback(async () => {
    try {
      const [productList, categoryList] = await Promise.all([getProducts(), getCategories()])
      setProducts(productList.map((product) => attachCategory(product, categoryList)))
      setCategories(categoryList)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    try {
      await deleteProduct(product.id)
      showToast('Product deleted')
      loadData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  function handleSaved() {
    setEditing(null)
    loadData()
  }

  const visibleProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <>
      <div className="admin-title row">
        <div>
          <h1>Products</h1>
          <p>{products.length} products in your store.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          <Plus size={18} /> Add product
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <SearchBar value={search} onChange={setSearch} placeholder="Search products..." />
        </div>

        <ErrorMessage message={error} />
        {loading && <Loader />}

        {!loading && !error && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th className="right">Actions</th></tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product">
                        <img src={product.image_url} alt="" onError={(event) => (event.currentTarget.src = FALLBACK_IMAGE)} />
                        <strong>{product.name}</strong>
                      </div>
                    </td>
                    <td>{product.category?.name || '—'}</td>
                    <td>
                      {formatPrice(getFinalPrice(product))}
                      {product.discount_percent > 0 && <small className="muted"> (-{product.discount_percent}%)</small>}
                    </td>
                    <td><span className={product.stock <= 5 ? 'text-danger' : ''}>{product.stock}</span></td>
                    <td className="right">
                      <button type="button" className="icon-button" onClick={() => setEditing(product)} aria-label={`Edit ${product.name}`}>
                        <Pencil size={17} />
                      </button>
                      <button type="button" className="icon-button danger" onClick={() => handleDelete(product)} aria-label={`Delete ${product.name}`}>
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
                {visibleProducts.length === 0 && (
                  <tr><td colSpan="5" className="muted center">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit product' : 'Add product'} onClose={() => setEditing(null)}>
          <ProductForm
            product={editing.id ? editing : null}
            categories={categories}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </>
  )
}

