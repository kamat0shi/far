import React, { useMemo, useState } from 'react'
import { useBooks, EXCHANGES, Exchange } from '../hooks/useBooks'
import { getBase } from '../lib/symbols'
import FavStar from '../components/FavStar'

type SpreadRow = {
  base: string
  minEx: Exchange
  maxEx: Exchange
  min: number
  max: number
  spreadAbs: number
  spreadPct: number
  count: number
}

export default function SpreadsPage() {
  const [selected, setSelected] = useState<Record<Exchange, boolean>>({ gate:true, mexc:true, ourbit:true })
  const [query, setQuery] = useState<string>('')
  const [minPct, setMinPct] = useState<number>(0.5)
  const [minExCount, setMinExCount] = useState<number>(2)
  const [sortDesc, setSortDesc] = useState<boolean>(true)

  const books = useBooks(selected)

  const spreadRows = useMemo<SpreadRow[]>(() => {
    const map: Record<string, Partial<Record<Exchange, number>>> = {}
    for (const ex of EXCHANGES) {
      if (!selected[ex]) continue
      for (const sym in books[ex]) {
        const r = books[ex][sym]
        if (typeof r?.last !== 'number') continue
        const base = getBase(r.symbol)
        if (!map[base]) map[base] = {}
        map[base][ex] = r.last
      }
    }
    const out: SpreadRow[] = []
    for (const base in map) {
      const entries = Object.entries(map[base]) as [Exchange, number][]
      if (entries.length < minExCount) continue
      let min = Infinity, max = -Infinity
      let minEx: Exchange = entries[0][0], maxEx: Exchange = entries[0][0]
      for (const [ex, px] of entries) {
        if (px < min) { min = px; minEx = ex }
        if (px > max) { max = px; maxEx = ex }
      }
      if (!isFinite(min) || !isFinite(max) || min <= 0) continue
      const spreadAbs = max - min
      const spreadPct = (max / min - 1) * 100
      if (query && !base.includes(query.toUpperCase())) continue
      if (spreadPct < minPct) continue
      out.push({ base, minEx, maxEx, min, max, spreadAbs, spreadPct, count: entries.length })
    }
    out.sort((a, b) => sortDesc ? b.spreadPct - a.spreadPct : a.spreadPct - b.spreadPct)
    return out
  }, [books, selected, query, minPct, minExCount, sortDesc])

  return (
    <>
      {/* Панель фильтров */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
        <fieldset className="border border-zinc-800 rounded-lg p-3">
          <legend className="px-2 text-sm text-zinc-400">Exchanges</legend>
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
          <div className="text-sm text-zinc-400 mb-2">Token filter</div>
          <input
            placeholder="e.g. BTC, SOL, DOGE"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          />
        </div>

        <div className="border border-zinc-800 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-zinc-400">Min spread, %</span>
              <input
                type="number" step="0.1" min="0"
                value={minPct}
                onChange={e => setMinPct(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-zinc-400">Min exchanges / token</span>
              <input
                type="number" min={2} max={EXCHANGES.length}
                value={minExCount}
                onChange={e => setMinExCount(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
              />
            </label>
          </div>
          <div className="mt-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-zinc-200"
                     checked={sortDesc}
                     onChange={e => setSortDesc(e.target.checked)} />
              <span>Sort by spread desc</span>
            </label>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                <th style={{width:36}}></th>
                <th>Base</th>
                <th className="text-right">Min</th>
                <th>↙ EX</th>
                <th className="text-right">Max</th>
                <th>↗ EX</th>
                <th className="text-right">Spread</th>
                <th className="text-right">Spread %</th>
                <th className="text-right">#EX</th>
            </tr>
          </thead>
          <tbody>
            {spreadRows.map(r => (
              <tr key={r.base} className="odd:bg-zinc-900/30 even:bg-zinc-900/10">
                <td className="px-2"><FavStar base={r.base} /></td>
                <td className="px-3 py-2 font-medium">{r.base}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmt(r.min)}</td>
                <td className="px-3 py-2">{r.minEx.toUpperCase()}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmt(r.max)}</td>
                <td className="px-3 py-2">{r.maxEx.toUpperCase()}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmt(r.spreadAbs)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.spreadPct.toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{r.count}</td>
              </tr>
            ))}
            {spreadRows.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-zinc-400">Waiting for data…</td></tr>
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
