import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ServerMsg, TickerRecord, connectWS } from '../ws'
import { EXCHANGES, Exchange } from '../hooks/useBooks'

export default function TokensPage() {
  const [exchange, setExchange] = useState<Exchange>('gate')
  const [rows, setRows] = useState<Record<string, TickerRecord>>({})
  const disconnectRef = useRef<null | (() => void)>(null)

  useEffect(() => {
    setRows({})
    disconnectRef.current?.()
    disconnectRef.current = connectWS(exchange, (msg: ServerMsg) => {
      if (msg.type === 'snapshot') {
        const map: Record<string, TickerRecord> = {}
        for (const r of msg.records) map[r.symbol] = r
        setRows(map)
      } else if (msg.type === 'tick') {
        setRows(prev => ({ ...prev, [msg.record.symbol]: msg.record }))
      }
    })
    return () => disconnectRef.current?.()
  }, [exchange])

  const list = useMemo(() => Object.values(rows), [rows])

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-zinc-400">Live tokens on selected exchange.</div>
        <select
          className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
          value={exchange}
          onChange={e => setExchange(e.target.value as Exchange)}
        >
          {EXCHANGES.map(ex => <option key={ex} value={ex}>{ex.toUpperCase()}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>Symbol</th>
              <th className="text-right">Last</th>
              <th className="text-right">Bid</th>
              <th className="text-right">Ask</th>
              <th className="text-right">Fair</th>
              <th className="text-right">Max size</th>
            </tr>
          </thead>
          <tbody>
            {list.map(r => (
              <tr key={r.symbol} className="odd:bg-zinc-900/30 even:bg-zinc-900/10">
                <td className="px-3 py-2 font-medium">{r.symbol}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmt(r.last)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.bid != null ? fmt(r.bid) : '—'}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.ask != null ? fmt(r.ask) : '—'}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.fair != null ? fmt(r.fair) : '—'}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.max_size ?? '—'}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-zinc-400">Loading…</td></tr>
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
