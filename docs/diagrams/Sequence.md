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

![Поиск токена](sequence/Sequence_SearchToken.png)

---

### 2. Просмотр спредов <a name="2"></a>

> Участники: **Пользователь** → **Web UI** → **Backend API** → **SpreadCalculator** → **ExchangeAdapter[N] / WS** → **Cache**  
> Основные сообщения: `openSpreadsView()`, `subscribeWS()`, `onTick()`, `calculateSpread()`, `updateUI()`

![Просмотр спредов](sequence/Sequence_ViewSpreads.png)

---

### 3. Просмотр биржи <a name="3"></a>

> Участники: **Пользователь** → **Web UI** → **Backend API** → **ExchangeAdapter(Биржа X)** → **Cache/DB**  
> Основные сообщения: `selectExchange()`, `listContracts()`, `fetchLastPrices()`, `renderExchangeTable()`

![Просмотр биржи](sequence/Sequence_ViewExchange.png)
