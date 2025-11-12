# pytest -q
# Юнит-тесты парсеров и нормализации

import time
from typing import Dict, Any

import exchanges as ex


def test_rows_from_payload_various():
    # имитируем разные форматы payload
    from app import rows_from_payload

    arr = [{"a": 1}, {"a": 2}]
    assert rows_from_payload(arr) == arr

    dlist = {"data": [{"a": 3}]}
    assert rows_from_payload(dlist) == [{"a": 3}]

    dsingle = {"data": {"a": 4}}
    assert rows_from_payload(dsingle) == [{"a": 4}]


def test_rest_parse_gate_ok():
    now = int(time.time() * 1000)
    src: Dict[str, Any] = {
        "contract": "BTC_USDT",
        "last": "65000",
        "highest_bid": "64990",
        "lowest_ask": "65010",
        "mark_price": "65005",
    }
    sym, last, bid, ask, fair, ts = ex.rest_parse_gate(src, now)
    assert sym == "BTC_USDT"
    assert last == 65000.0
    assert bid == 64990.0
    assert ask == 65010.0
    assert fair == 65005.0
    assert ts == now


def test_rest_parse_mexc_like_ok():
    now = int(time.time() * 1000)
    src = {
        "symbol": "BTC_USDT",
        "lastPrice": "65000",
        "bid1": "64990",
        "ask1": "65010",
        "fairPrice": "65005",
        "timestamp": now,
    }
    sym, last, bid, ask, fair, ts = ex.rest_parse_mexc_like(src, now)
    assert sym == "BTC_USDT"
    assert last == 65000.0
    assert bid == 64990.0
    assert ask == 65010.0
    assert fair == 65005.0
    assert ts == now


def test_meta_payloads_and_normalize_record():
    # gate: max_size берём из order_size_max
    meta_gate = ex.meta_payload_gate({
        "order_price_round": "0.1",
        "mark_price_round": "0.1",
        "order_size_min": "1",
        "order_size_max": "100",  # важно
    })
    rec = ex.normalize_record("gate", "BTC_USDT", 1.0, 0.9, 1.1, 1.0, 123, meta_gate)
    assert rec["max_size"] == "100"

    # mexc/ourbit: max_size из maxVol
    meta_m = ex.meta_payload_mexc_like({"maxVol": "250"})
    rec2 = ex.normalize_record("mexc", "BTC_USDT", 1.0, None, None, None, 123, meta_m)
    assert rec2["max_size"] == "250"
