import { useState } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = (msg, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }

  return { toasts, toast }
}
