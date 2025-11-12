# Тесты WS без внешних запросов:
# заполняем in-memory кэш PRICES/META вручную и проверяем snapshot.
# ВАЖНО: запускай pytest из папки backend (чтобы import app сработал).

import json
import pytest
from starlette.testclient import TestClient

import app as appmod


@pytest.fixture(autouse=True)
def _clean_state():
    # перед каждым тестом чистим и наполняем кэши
    for ex in appmod.PRICES.keys():
        appmod.PRICES[ex].clear()
        appmod.META[ex].clear()

    # положим одну запись для gate
    appmod.PRICES["gate"]["BTC_USDT"] = {
        "last": 65000.0, "bid": 64990.0, "ask": 65010.0, "fair": 65005.0, "ts": 111
    }
    appmod.META["gate"]["BTC_USDT"] = {"order_size_max": "100"}

    yield

    # отписка всех клиентов (на случай падений)
    for ws in list(appmod.SUBS["gate"]):
        appmod.SUBS["gate"].discard(ws)


def test_ws_snapshot_contains_normalized_record():
    client = TestClient(appmod.app)

    with client.websocket_connect("/ws?exchange=gate") as ws:
        # первое сообщение — snapshot
        msg = ws.receive_text()
        data = json.loads(msg)
        assert data["type"] == "snapshot"
        assert isinstance(data["records"], list) and len(data["records"]) == 1

        rec = data["records"][0]
        assert rec["exchange"] == "gate"
        assert rec["symbol"] == "BTC_USDT"
        assert rec["last"] == 65000.0
        assert rec["bid"] == 64990.0
        assert rec["ask"] == 65010.0
        assert rec["fair"] == 65005.0
        assert rec["ts"] == 111
        assert rec["max_size"] == "100"  # из meta → order_size_max
