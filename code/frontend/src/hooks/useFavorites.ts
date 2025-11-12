import { useCallback, useEffect, useState } from 'react'

const KEY = 'far:favs'

function readFavs(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function useFavorites() {
  const [favs, setFavs] = useState<Set<string>>(() => new Set(readFavs()))

  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) setFavs(new Set(readFavs())) }
    const onCustom = () => setFavs(new Set(readFavs()))
    window.addEventListener('storage', onStorage)
    window.addEventListener('far:favs', onCustom as any)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('far:favs', onCustom as any)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify([...favs]))
    window.dispatchEvent(new Event('far:favs'))
  }, [favs])

  const add    = useCallback((b: string) => setFavs(prev => new Set(prev).add(b)), [])
  const remove = useCallback((b: string) => setFavs(prev => { const n = new Set(prev); n.delete(b); return n }), [])
  const toggle = useCallback((b: string) => setFavs(prev => { const n = new Set(prev); n.has(b) ? n.delete(b) : n.add(b); return n }), [])
  const has    = useCallback((b: string) => favs.has(b), [favs])

  return { favs, list: [...favs].sort(), add, remove, toggle, has }
}
