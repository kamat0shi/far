export type TickerRecord = {
  exchange: string
  symbol: string
  last: number
  bid?: number
  ask?: number
  fair?: number
  ts: number
  max_size?: number | string
}

type SnapshotMsg = { type: 'snapshot'; records: TickerRecord[] }
type TickMsg = { type: 'tick'; record: TickerRecord }
type MetaBatchMsg = { type: 'meta_batch'; count: number }
type PingMsg = { type: 'ping' }
export type ServerMsg = SnapshotMsg | TickMsg | MetaBatchMsg | PingMsg

export function connectWS(exchange: string, onMessage: (m: ServerMsg) => void) {
  let ws: WebSocket | null = null
  let closed = false
  let retry = 500

  const open = () => {
    ws = new WebSocket(`ws://localhost:8000/ws?exchange=${encodeURIComponent(exchange)}`)
    ws.onopen = () => { retry = 500 }
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as ServerMsg
        onMessage(msg)
      } catch { /* ignore */ }
    }
    ws.onclose = () => {
      if (!closed) setTimeout(open, Math.min(5000, retry *= 1.5))
    }
    ws.onerror = () => {
      try { ws?.close() } catch {}
    }
  }
  open()
  return () => { closed = true; try { ws?.close() } catch {} }
}
