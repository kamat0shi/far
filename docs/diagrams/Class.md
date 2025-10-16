# Диаграмма классов

---

# Содержание
1. [Общая структура приложения](#1)
2. [Backend: основные классы](#2)
3. [Frontend (UI) компоненты](#3)

---

### 1. Общая структура приложения <a name="1"></a>

```mermaid
classDiagram
    direction LR

    class User {
        +id: int
        +email: str
        +password_hash: str
        +favorites: List<Token>
        +alerts: List<AlertRule>
        +create_account()
        +login()
    }

    class Token {
        +symbol: str
        +base: str
        +quote: str
        +exchange: str
        +last_price: float
        +mark_price: float
        +price_24h_change: float
        +update_prices()
    }

    class Exchange {
        +name: str
        +api_rest_url: str
        +api_ws_url: str
        +status: str
        +fetch_contracts()
        +fetch_prices()
    }

    class Spread {
        +base: str
        +exchange_a: str
        +exchange_b: str
        +spread_abs: float
        +spread_pct: float
        +timestamp: datetime
        +calculate()
    }

    class AlertRule {
        +id: int
        +user_id: int
        +token: Token
        +spread_threshold: float
        +active: bool
        +channel: str
        +check_condition()
    }

    User "1" --> "*" Token : favorites
    User "1" --> "*" AlertRule
    Token "1" --> "1" Exchange
    Spread --> Token
```

### 2. Backend: основные классы <a name="2"></a>

```mermaid
classDiagram
    class BackendAPI {
        +get_token_prices(base)
        +get_spreads(base)
        +get_exchange_contracts(exchange)
        +add_to_favorites(user, token)
        +remove_from_favorites(user, token)
    }

    class ExchangeAdapter {
        +exchange_name: str
        +get_contracts()
        +get_prices()
        +parse_response()
    }

    class SpreadCalculator {
        +calculate_spreads(data)
        +normalize_symbols()
    }

    class CacheDB {
        +get(key)
        +set(key, value)
        +invalidate(key)
    }

    BackendAPI --> ExchangeAdapter
    BackendAPI --> SpreadCalculator
    BackendAPI --> CacheDB
    SpreadCalculator --> Token
```

### 3. Frontend (UI) компоненты <a name="3"></a>

```mermaid
classDiagram
    class WebUI {
        +render_exchange_table()
        +render_spreads_table()
        +render_favorites()
        +handle_user_actions()
    }

    class AuthModal {
        +show_login()
        +show_signup()
        +submit()
    }

    class FavoritesPage {
        +list_favorites()
        +remove_favorite()
        +edit_alert()
    }

    class SpreadPage {
        +subscribe_ws()
        +update_spreads()
    }

    WebUI --> AuthModal
    WebUI --> SpreadPage
    WebUI --> FavoritesPage
```