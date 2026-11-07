// A label + input + error message. Keeps every form in the project consistent.
export default function FormField({ label, id, error, as = 'input', ...inputProps }) {
  const Element = as // 'input', 'textarea' or 'select'
  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <Element id={id} name={id} aria-invalid={Boolean(error)} {...inputProps} />
      {error && <small className="field-error">{error}</small>}
    </div>
  )
}

export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email)

