```memraid
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
    Error --> Loading: Повторить попытку (Retry)

    Results --> [*]: Навигация на «Спреды»
```