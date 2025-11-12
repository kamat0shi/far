import React, { useMemo, useState } from 'react'
import { useBooks, EXCHANGES, Exchange } from '../hooks/useBooks'
import { useFavorites } from '../hooks/useFavorites'
import { getBase } from '../lib/symbols'
import FavStar from '../components/FavStar'

type Row = { base: string; prices: Partial<Record<Exchange, number>>; min?: number; max?: number; pct?: number }

export default function FavoritesPage() {
  const { list: favBases } = useFavorites()
  const [selected, setSelected] = useState<Record<Exchange, boolean>>({ gate:true, mexc:true, ourbit:true })
  const books = useBooks(selected)
  const enabledEx = EXCHANGES.filter(ex => selected[ex])

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = []
    for (const base of favBases) {
      const prices: Partial<Record<Exchange, number>> = {}
      for (const ex of enabledEx) {
        let px: number | undefined
        for (const sym in books[ex]) {
          if (getBase(sym) === base) { px = books[ex][sym].last; break }
        }
        if (px != null) prices[ex] = px
      }
      const vals = Object.values(prices).filter(v => typeof v === 'number') as number[]
      let min, max, pct
      if (vals.length >= 2) {
        min = Math.min(...vals); max = Math.max(...vals)
        if (min > 0) pct = (max / min - 1) * 100
      }
      out.push({ base, prices, min, max, pct })
    }
    out.sort((a,b) => a.base.localeCompare(b.base))
    return out
  }, [favBases, books, enabledEx])

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
        <fieldset className="border border-zinc-800 rounded-lg p-3">
          <legend className="px-2 text-sm text-zinc-400">Биржи (столбцы)</legend>
          <div className="flex flex-wrap gap-2">
            {EXCHANGES.map(ex => (
              <label key={ex} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-zinc-200"
                  checked={!!selected[ex]}
                  onChange={e => setSelected(s => ({ ...s, [ex]: e.target.checked }))}
                />
                <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700">{ex.toUpperCase()}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="border border-zinc-800 rounded-lg p-3">
          <div className="text-sm text-zinc-400">Всего в избранном: <b>{favBases.length}</b></div>
          <div className="text-xs text-zinc-500">Добавляйте/удаляйте ⭐ на Matrix/Spreads</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th style={{width:36}}></th>
              <th>Token</th>
              {enabledEx.map(ex => <th key={ex} className="text-right">{ex.toUpperCase()}</th>)}
              <th className="text-right">Min</th>
              <th className="text-right">Max</th>
              <th className="text-right">Spread %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.base} className="odd:bg-zinc-900/30 even:bg-zinc-900/10">
                <td className="px-2"><FavStar base={r.base}/></td>
                <td className="px-3 py-2 font-medium">{r.base}</td>
                {enabledEx.map(ex => (
                  <td key={ex} className="px-3 py-2 text-right tabular-nums">
                    {r.prices[ex] != null ? fmt(r.prices[ex]!) : '—'}
                  </td>
                ))}
                <td className="px-3 py-2 text-right tabular-nums">{r.min != null ? fmt(r.min) : '—'}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.max != null ? fmt(r.max) : '—'}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.pct != null ? r.pct.toFixed(2) : '—'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={3 + enabledEx.length} className="px-3 py-8 text-center text-zinc-400">Пусто. Добавьте токены ⭐</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

function fmt(n: number) {
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 8 })
}
