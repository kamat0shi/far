# Диаграммы последовательностей

---

# Содержание
1. [«Биржи» — состояния экрана](#1)
2. [«Спреды» — живое обновление](#2)
3. [«Избранное» (этап 2)](#3)

---

### 1. «Биржи» — состояния экрана <a name="1"></a>


```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle: Экран открыт, фильтры по умолчанию
    Idle --> Loading: Поиск / Изменение фильтров
    Loading: Запрос к API (инструменты/цены)

    Loading --> Results: success & results>0
    Loading --> Empty: success & results==0
    Loading --> Error: API error/timeout

    Results: Таблица цен отображена
    Results --> Filtering: Изменение фильтров/поиска
    Filtering --> Loading: Применить фильтры

    Results --> AddFav: ☆ Добавить в избранное (только авторизованные)
    AddFav --> Results: success
    AddFav --> Error: already exists / server error

    Empty --> Loading: Изменить запрос/фильтры
    Error --> Loading: Retry

    Results --> [*]: Навигация на «Спреды»

```

### 2. «Спреды» — живое обновление <a name="2"></a>

```mermaid
stateDiagram-v2
    [*] --> SnapshotLoading

    SnapshotLoading: Инициирующий REST-снимок
    SnapshotLoading --> LiveConnecting: snapshot ok
    SnapshotLoading --> Error: snapshot error

    LiveConnecting: Подписки WS на биржи
    LiveConnecting --> Live: WS connected
    LiveConnecting --> Polling: WS недоступен

    Live: Приём тиков, расчёт спредов,\nобновление таблицы (real-time)
    Live --> Reconnecting: WS disconnect
    Reconnecting: Переподключение…
    Reconnecting --> Live: WS reconnected
    Reconnecting --> Polling: fallback to REST

    Polling: Периодический REST-опрос котировок
    Polling --> LiveConnecting: WS стал доступен
    Polling --> Error: многократные ошибки

    Error --> SnapshotLoading: Retry
```


### 3. «Избранное» (этап 2) <a name="3"></a>

```mermaid
stateDiagram-v2
    [*] --> AuthCheck

    AuthCheck: Проверка авторизации
    AuthCheck --> AuthRequired: не авторизован
    AuthCheck --> Loading: авторизован

    AuthRequired: Показать экран/модал «Войдите»
    AuthRequired --> Loading: успешный вход

    Loading: Загрузка избранного,\nцен и статусов депозит/вывод
    Loading --> List: success & count>0
    Loading --> Empty: success & count==0
    Loading --> Error: API error

    state List {
        [*] --> View
        View: Таблица избранного

        View --> EditAlert: Настроить уведомление
        EditAlert: Модал правила (биржи A/B, порог %, срок, канал)
        EditAlert --> SavingRule: Save
        SavingRule --> View: success
        SavingRule --> Error: validation/server error

        View --> RemoveItem: ★ Удалить токен
        RemoveItem --> View: success (row removed)
    }

    Empty --> Hint: Показать подсказку «Добавьте токены на странице Биржи»
    Hint --> Loading: Перейти/добавить и вернуться

    Error --> Loading: Retry
```
