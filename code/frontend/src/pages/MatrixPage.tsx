import React, { useMemo, useState } from 'react'
import { useBooks, EXCHANGES, Exchange } from '../hooks/useBooks'
import { getBase } from '../lib/symbols'
import FavStar from '../components/FavStar'

type Row = { base: string; prices: Partial<Record<Exchange, number>> }

export default function MatrixPage() {
  const [selected, setSelected] = useState<Record<Exchange, boolean>>({ gate:true, mexc:true, ourbit:true })
  const [query, setQuery] = useState('')
  const [minExCount, setMinExCount] = useState<number>(2)

  const books = useBooks(selected)

  const rows = useMemo<Row[]>(() => {
    const map: Record<string, Partial<Record<Exchange, number>>> = {}
    for (const ex of EXCHANGES) {
      if (!selected[ex]) continue
      for (const sym in books[ex]) {
        const r = books[ex][sym]
        const base = getBase(r.symbol)
        if (!map[base]) map[base] = {}
        if (typeof r.last === 'number') map[base][ex] = r.last
      }
    }
    const list: Row[] = []
    for (const base in map) {
      const entries = Object.entries(map[base]) as [Exchange, number][]
      if (entries.length < minExCount) continue
      if (query && !base.includes(query.toUpperCase())) continue
      list.push({ base, prices: map[base] })
    }
    // сортируем по названию base
    list.sort((a,b) => a.base.localeCompare(b.base))
    return list
  }, [books, selected, query, minExCount])

  const enabledEx = EXCHANGES.filter(ex => selected[ex])

  return (
    <>
      {/* Контролы */}
      <div className="grid md:grid-cols-3 gap-3 mb-3">
        <fieldset className="border border-zinc-800 rounded-lg p-3">
          <legend className="px-2 text-sm text-zinc-400">Exchanges (columns)</legend>
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
          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-400">Min exchanges / token</span>
            <input
              type="number" min={1} max={EXCHANGES.length}
              value={minExCount}
              onChange={e => setMinExCount(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
            />
          </label>
        </div>
      </div>

      {/* Матрица */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                <th style={{width:36}}></th>   {/* новый столбец под звезду */}
                <th>Token</th>
                {enabledEx.map(ex => (
                    <th key={ex} className="text-right">{ex.toUpperCase()}</th>
                ))}
                </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.base} className="odd:bg-zinc-900/30 even:bg-zinc-900/10">
                <td className="px-2"><FavStar base={r.base} /></td>
                <td className="px-3 py-2 font-medium">{r.base}</td>
                {enabledEx.map(ex => (
                    <td key={ex} className="px-3 py-2 text-right tabular-nums">
                    {r.prices[ex] != null ? fmt(r.prices[ex]!) : '—'}
                    </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={1 + enabledEx.length} className="px-3 py-8 text-center text-zinc-400">Waiting for data…</td></tr>
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
