import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { createCategory, deleteCategory, getCategories, updateCategory } from '../services/productService'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import FormField from '../components/FormField'
import { ErrorMessage, Loader } from '../components/Feedback'

function CategoryForm({ category, onSaved, onCancel }) {
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: category?.name || '', description: category?.description || '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const newErrors = {}
    if (form.name.trim().length < 2) newErrors.name = 'Enter a category name'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSaving(true)
    setServerError('')
    const data = { name: form.name.trim(), description: form.description.trim() }
    try {
      if (category) await updateCategory(category.id, data)
      else await createCategory(data)
      showToast(category ? 'Category updated' : 'Category added')
      onSaved()
    } catch (error) {
      setServerError(error.message.includes('duplicate') ? 'A category with this name already exists' : error.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <ErrorMessage message={serverError} />
      <FormField label="Name" id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
      <FormField label="Description" id="description" as="textarea" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : category ? 'Save changes' : 'Add category'}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

export default function CategoriesManager() {
  const { showToast } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null = closed, {} = new, category = edit

  const loadData = useCallback(async () => {
    try {
      setCategories(await getCategories())
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

  async function handleDelete(category) {
    const message = `Delete "${category.name}"? Its products will stay in the store but have no category.`
    if (!window.confirm(message)) return
    try {
      await deleteCategory(category.id)
      showToast('Category deleted')
      loadData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <>
      <div className="admin-title row">
        <div>
          <h1>Categories</h1>
          <p>Group your products so customers can find them.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          <Plus size={18} /> Add category
        </button>
      </div>

      <div className="card">
        <ErrorMessage message={error} />
        {loading && <Loader />}
        {!loading && !error && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Slug</th><th>Description</th><th className="right">Actions</th></tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td><strong>{category.name}</strong></td>
                    <td><code>{category.slug}</code></td>
                    <td className="muted">{category.description || '—'}</td>
                    <td className="right">
                      <button type="button" className="icon-button" onClick={() => setEditing(category)} aria-label={`Edit ${category.name}`}>
                        <Pencil size={17} />
                      </button>
                      <button type="button" className="icon-button danger" onClick={() => handleDelete(category)} aria-label={`Delete ${category.name}`}>
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan="4" className="muted center">No categories yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit category' : 'Add category'} onClose={() => setEditing(null)}>
          <CategoryForm
            category={editing.id ? editing : null}
            onSaved={() => { setEditing(null); loadData() }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </>
  )
}

