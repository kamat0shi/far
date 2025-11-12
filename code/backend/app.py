# app.py
import os, json, asyncio, random, time
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

import aiohttp
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from exchanges import EXCH_DEF, normalize_record

load_dotenv()

EXCHANGES = (os.getenv("EXCHANGES") or "gate,mexc,ourbit").replace(" ", "").lower().split(",")
INTERVAL_MIN  = float(os.getenv("INTERVAL_MIN", "0.6"))
INTERVAL_MAX  = float(os.getenv("INTERVAL_MAX", "1.2"))
HTTP_TIMEOUT  = float(os.getenv("HTTP_TIMEOUT", "10"))

app = FastAPI(title="Futures Arbitrage Radar API")

# CORS для локальной разработки фронта
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # сузим позже
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- in-memory state -----
PRICES: Dict[str, Dict[str, Dict[str, Any]]] = {ex: {} for ex in EXCHANGES}
META:   Dict[str, Dict[str, Dict[str, Any]]] = {ex: {} for ex in EXCHANGES}

# подписчики на биржу: exchange -> set(websocket)
SUBS: Dict[str, "set[WebSocket]"] = {ex: set() for ex in EXCHANGES}

async def fetch_json(session: aiohttp.ClientSession, url: str) -> Any:
    async with session.get(url) as r:
        r.raise_for_status()
        return await r.json(content_type=None)

def rows_from_payload(data: Any) -> List[Dict[str, Any]]:
    if isinstance(data, list): return data
    if isinstance(data, dict):
        d = data.get("data")
        if isinstance(d, list): return d
        if isinstance(d, dict): return [d]
    raise RuntimeError(f"Unexpected payload type: {type(data).__name__}")

async def broadcaster(exchange: str, msg: Dict[str, Any]):
    dead = []
    for ws in list(SUBS[exchange]):
        try:
            await ws.send_text(json.dumps(msg, separators=(",", ":")))
        except Exception:
            dead.append(ws)
    for ws in dead:
        SUBS[exchange].discard(ws)

async def poll_exchange(exchange: str):
    """Фоновая задача: тянет тикеры и мету, и рассылает дельты WS-клиентам."""
    if exchange not in EXCH_DEF:
        return
    cfg = EXCH_DEF[exchange]
    timeout = aiohttp.ClientTimeout(total=HTTP_TIMEOUT)

    next_meta_at = time.time()  # сразу получим мету в первый цикл
    async with aiohttp.ClientSession(timeout=timeout, headers={"User-Agent": "FAR/0.1"}) as session:
        while True:
            start = time.time()
            try:
                # тикеры
                tick = await fetch_json(session, cfg["tickers"])
                rows = rows_from_payload(tick)
                now_ms = int(time.time() * 1000)
                updates = 0
                for it in rows:
                    parsed = cfg["rest_parse"](it, now_ms)
                    if not parsed:
                        continue
                    sym, last, bid, ask, fair, ts = parsed
                    PRICES[exchange][sym] = {"last": last, "bid": bid, "ask": ask, "fair": fair, "ts": ts}
                    updates += 1
                    # рассылаем дельту по символу
                    meta = META[exchange].get(sym, {})
                    await broadcaster(exchange, {
                        "type": "tick",
                        "record": normalize_record(exchange, sym, last, bid, ask, fair, ts, meta)
                    })

                # периодическая мета
                if time.time() >= next_meta_at:
                    try:
                        meta_payload = await fetch_json(session, cfg["meta"])
                        metas = rows_from_payload(meta_payload)
                        pushed = 0
                        for d in metas:
                            sym = cfg["meta_sym"](d)
                            if not sym:
                                continue
                            payload = cfg["meta_payload"](d)
                            META[exchange][sym] = payload
                            pushed += 1
                        # можно пушнуть батч меты, чтобы фронт пересчитал max_size
                        await broadcaster(exchange, {"type": "meta_batch", "count": pushed})
                    finally:
                        # обновляем раз в 5–12 секунд
                        next_meta_at = time.time() + random.uniform(5.0, 12.0)

                dur_ms = int((time.time() - start) * 1000)
                # легкая пауза
                await asyncio.sleep(random.uniform(INTERVAL_MIN, INTERVAL_MAX))
            except Exception as e:
                # лог можно добавить; держим живым цикл
                await asyncio.sleep(1.0)

@app.on_event("startup")
async def on_start():
    # запускаем фоновые поллеры по выбранным биржам
    tasks = []
    for ex in EXCHANGES:
        if ex in EXCH_DEF:
            tasks.append(asyncio.create_task(poll_exchange(ex)))
    # ждём малость, чтобы кэши наполнились (не блокируя стартап)
    await asyncio.sleep(0.1)

@app.websocket("/ws")
async def ws_prices(ws: WebSocket, exchange: str = Query(..., description="gate|mexc|ourbit")):
    if exchange not in EXCH_DEF:
        await ws.close(code=1008)
        return
    await ws.accept()
    SUBS[exchange].add(ws)
    try:
        # отдать снапшот (сливаем PRICES + META → таблица)
        snapshot = []
        meta_map = META[exchange]
        for sym, p in PRICES[exchange].items():
            snapshot.append(
                normalize_record(
                    exchange, sym,
                    p.get("last"), p.get("bid"), p.get("ask"), p.get("fair"), p.get("ts"),
                    meta_map.get(sym, {})
                )
            )
        await ws.send_text(json.dumps({"type": "snapshot", "records": snapshot}, separators=(",", ":")))

        # держим соединение; входящих сообщений не ждём (но читаем пинги клиента)
        while True:
            # чтобы не зависать, читаем с таймаутом
            try:
                _ = await asyncio.wait_for(ws.receive_text(), timeout=60.0)
            except asyncio.TimeoutError:
                # отправим ping-подобный no-op
                await ws.send_text('{"type":"ping"}')
    except WebSocketDisconnect:
        pass
    finally:
        SUBS[exchange].discard(ws)
