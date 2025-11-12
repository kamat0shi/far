import React from 'react'
import { useFavorites } from '../hooks/useFavorites'

export default function FavStar({ base }: { base: string }) {
  const { has, toggle } = useFavorites()
  const active = has(base)
  return (
    <button
      onClick={() => toggle(base)}
      className="px-1"
      title={active ? 'Удалить из избранного' : 'В избранное'}
    >
      <span className={active ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}>
        {active ? '★' : '☆'}
      </span>
    </button>
  )
}
