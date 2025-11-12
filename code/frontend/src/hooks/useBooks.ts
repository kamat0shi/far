import { useEffect, useRef, useState } from 'react'
import { connectWS, ServerMsg, TickerRecord } from '../ws'

export const EXCHANGES = ['gate','mexc','ourbit'] as const
export type Exchange = typeof EXCHANGES[number]

export type BooksState = Record<Exchange, Record<string, TickerRecord>>

export function useBooks(selected: Record<Exchange, boolean>) {
  const [books, setBooks] = useState<BooksState>({ gate:{}, mexc:{}, ourbit:{} })
  const disconnectsRef = useRef<Record<Exchange, ()=>void>>({})

  useEffect(() => {
    for (const ex of EXCHANGES) {
      const should = !!selected[ex]
      const isOn = !!disconnectsRef.current[ex]
      if (should && !isOn) {
        const off = connectWS(ex, (msg: ServerMsg) => {
          if (msg.type === 'snapshot') {
            setBooks(prev => ({
              ...prev,
              [ex]: Object.fromEntries(msg.records.map(r => [r.symbol, r]))
            }))
          } else if (msg.type === 'tick') {
            setBooks(prev => ({ ...prev, [ex]: { ...prev[ex], [msg.record.symbol]: msg.record } }))
          }
        })
        disconnectsRef.current[ex] = off
      } else if (!should && isOn) {
        disconnectsRef.current[ex]!()
        delete disconnectsRef.current[ex]
        setBooks(prev => ({ ...prev, [ex]: {} }))
      }
    }
    return () => {
      for (const ex of EXCHANGES) disconnectsRef.current[ex]?.()
      disconnectsRef.current = {}
    }
  }, [selected])

  return books
}
