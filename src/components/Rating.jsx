import { Star } from 'lucide-react'

// Shows a star icon, the rating number and (optionally) a label.
export default function Rating({ value }) {
  return (
    <span className="rating" aria-label={`Rated ${value} out of 5`}>
      <Star size={14} fill="currentColor" />
      {Number(value).toFixed(1)}
    </span>
  )
}

