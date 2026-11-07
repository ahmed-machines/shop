import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

// Like useState, but the value is also kept in the URL (?name=value).
// - Typing updates the local state immediately, so the input never loses characters.
// - The URL is updated after a short pause (debounce), so links can be shared.
// - If the URL changes from elsewhere (e.g. the navbar search), the value follows it.
export default function useUrlParam(name, delay = 300) {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlValue = searchParams.get(name) || ''
  const [value, setValue] = useState(urlValue)

  // URL -> local state
  useEffect(() => {
    setValue(urlValue)
  }, [urlValue])

  // local state -> URL (after the user stops typing)
  useEffect(() => {
    if (value === urlValue) return
    const timer = setTimeout(() => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (value) next.set(name, value)
          else next.delete(name)
          return next
        },
        { replace: true },
      )
    }, delay)
    return () => clearTimeout(timer)
  }, [value, urlValue, name, delay, setSearchParams])

  return [value, setValue]
}

