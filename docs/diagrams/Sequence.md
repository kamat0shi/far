# Диаграммы последовательностей

---

# Содержание
1. [Поиск токена](#1)
2. [Просмотр спредов](#2)
3. [Просмотр биржи](#3)

---

### 1. Поиск токена <a name="1"></a>

> Участники: **Пользователь** → **Web UI** → **Backend API** → **Cache/DB** → **ExchangeAdapter[N]**  
> Основные сообщения: `searchToken()`, `getInstruments()`, `fetchPrices()`, `normalize()`, `renderTable()`

```mermaid
sequenceDiagram
    autonumber
    actor U as Пользователь
    participant UI as Web UI SPA
    participant API as Backend API
    participant C as Cache/DB
    participant EX as ExchangeAdapter[N]

    U->>UI: Ввод base ("SOL") и поиск
    UI->>API: GET /api/search?base=SOL
    API->>C: getInstruments(base)

    alt cache hit
        C-->>API: instruments[]
    else cache miss
        par по биржам
            API->>EX: fetchInstruments(base)
            EX-->>API: instruments[i]
        end
    end

    API->>API: normalize() + merge()
    par цены по биржам
        API->>EX: fetchPrices(symbols)
        EX-->>API: quotes[i]
    end

    API-->>UI: 200 JSON (exchange, symbol, last/mark, 24hΔ)
    UI->>UI: renderTable()

    alt ничего не найдено
        UI->>U: "Токен не найден"
    end

```

---

### 2. Просмотр спредов <a name="2"></a>

> Участники: **Пользователь** → **Web UI** → **Backend API** → **SpreadCalculator** → **ExchangeAdapter[N] / WS** → **Cache**  
> Основные сообщения: `openSpreadsView()`, `subscribeWS()`, `onTick()`, `calculateSpread()`, `updateUI()`

```mermaid
sequenceDiagram
    autonumber
    actor U as Пользователь
    participant UI as Web UI
    participant API as Backend API
    participant CALC as SpreadCalculator
    participant WS as Exchange WS/Adapters
    participant C as Cache

    U->>UI: Открыть "Спреды"
    UI->>API: GET /api/spreads?base=SOL
    par подписки по биржам
        API->>WS: subscribe(base)
    end

    loop onTick
        WS-->>API: tick(exchange, price)
        API->>C: save(tick)
        API->>CALC: calculate(base)
        CALC-->>API: spreads[]
        API-->>UI: push(spreads)
        UI->>UI: updateUI()
    end

    alt Разрыв WS
        UI->>API: периодический GET /api/prices?base=SOL
        API->>CALC: calculate()
        CALC-->>API: spreads[]
        API-->>UI: spreads snapshot
        UI->>UI: "Переподключение…"
    end
```

---

### 3. Просмотр биржи <a name="3"></a>

> Участники: **Пользователь** → **Web UI** → **Backend API** → **ExchangeAdapter(Биржа X)** → **Cache/DB**  
> Основные сообщения: `selectExchange()`, `listContracts()`, `fetchLastPrices()`, `renderExchangeTable()`

```mermaid
sequenceDiagram
    autonumber
    actor U as Пользователь
    participant UI as Web UI
    participant API as Backend API
    participant EX as ExchangeAdapter(Биржа X)
    participant C as Cache/DB

    U->>UI: Выбрать биржу (OKX)
    UI->>API: GET /api/exchanges/okx/contracts
    API->>C: getContracts(OKX)

    alt cache hit
        C-->>API: contracts[]
    else cache miss
        API->>EX: listContracts()
        EX-->>API: contracts[]
        API->>C: save(contracts)
    end

    par получать цены
        API->>EX: fetchLastPrices(contracts)
        EX-->>API: quotes[]
    end

    API-->>UI: 200 JSON (contract,type,margin,last,24hΔ)
    UI->>UI: renderExchangeTable()

    opt Показать спред
        UI->>UI: переход на "Спреды"
    end
```
