# Содержание
1. [Диаграмма компонентов](#components)
2. [Диаграмма развёртывания](#deployment)

---

### 1. Диаграмма компонентов <a name="components"></a>

```mermaid
graph TD
    subgraph Frontend [Frontend (React SPA)]
        UI[Web UI / React Components]
        Auth[Auth Modal]
        SpreadView[Spreads Page]
        FavView[Favorites Page]
    end

    subgraph Backend [Backend (FastAPI / Python)]
        API[REST API Layer]
        Adapters[Exchange Adapters]
        SpreadCalc[Spread Calculator]
        DB[(PostgreSQL)]
        Cache[(Redis)]
    end

    subgraph External [Внешние API бирж]
        OKX[OKX API]
        Bybit[Bybit API]
        Binance[Binance Futures API]
        MEXC[MEXC API]
    end

    UI -->|HTTP / JSON| API
    Auth --> API
    SpreadView -->|WS/HTTP| API
    FavView --> API

    API --> DB
    API --> Cache
    API --> Adapters
    Adapters --> External
    API --> SpreadCalc
    SpreadCalc --> Cache
```

### 2. Диаграмма развёртывания <a name="deployment"></a>

```mermaid
graph TD
    subgraph UserDevice [User Device]
        Browser[Browser (React SPA)]
    end

    subgraph Server [VPS / Cloud Host]
        Nginx[Nginx Reverse Proxy]
        BackendApp[FastAPI Backend]
        Redis[Redis Cache]
        Postgres[(PostgreSQL Database)]
    end

    subgraph ExternalAPIs [Exchange Networks]
        OKX[OKX REST/WS]
        Bybit[Bybit REST/WS]
        Binance[Binance REST/WS]
        MEXC[MEXC REST/WS]
    end

    Browser -->|HTTPS| Nginx
    Nginx --> BackendApp
    BackendApp --> Redis
    BackendApp --> Postgres
    BackendApp -->|REST/WS| OKX
    BackendApp -->|REST/WS| Bybit
    BackendApp -->|REST/WS| Binance
    BackendApp -->|REST/WS| MEXC
```

SPA (React) развёрнута как статические файлы в Nginx, который проксирует /api/* к FastAPI.

Backend (FastAPI) обращается к Redis (кэш) и PostgreSQL (данные пользователей).

Подключения к биржам выполняются через адаптеры с REST/WS каналами.

Возможна контейнеризация: frontend, backend, db, cache в Docker Compose.


---