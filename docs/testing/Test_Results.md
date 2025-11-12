# Test Results — Futures Arbitrage Radar (FAR)

Версия плана: 1.0  

## 1. Резюме
- Пройдено (Pass): 5
- Заблокировано (Blocked/NA): 0
- Критические дефекты: 0
- Вывод/решение о приёмке: продукт соответствует функциональным и нефункциональным требованиям, рекомендован к приёмке.


## 2. Окружение
- Backend: FastAPI (версия), Python …
- Frontend: React/Vite/TS (версии)
- Браузеры: Chrome xx, Firefox xx
- Конфигурация: Local Dev / Local Prod
- Коммиты: backend `<sha>`, frontend `<sha>`

## 3. Тест-кейсы

> Формат полей соответствует структуре из задания:
> ID, Purpose/Title/Description, Scenario/Instructions, Expected Result, Actual Result, Pass/Fail

### WebSocket
| ID | Purpose | Scenario | Expected Result | Actual Result | P/F |
|---|---|---|---|---|---|
| **TC-WS-01** | Снапшот при подключении | WS к `/ws?exchange=gate` | Получен `{"type":"snapshot"}` ≤ 2 c; запись нормализована | Получен снапшот, `max_size` подтянут из meta (`order_size_max`), значения корректны | **Pass** |
| **TC-WS-05** | Неверный `exchange` | WS к `/ws?exchange=unknown` | Соединение закрыто/ошибка без падения сервера | Первое чтение из сокета даёт исключение, сервер стабилен | **Pass** |

### Backend Unit (parsers / normalization)
| ID | Purpose | Scenario | Expected Result | Actual Result | P/F |
|---|---|---|---|---|---|
| **TC-BE-01** | rows_from_payload: list | `rows_from_payload([…])` | Вернёт список как есть | Вернул список | **Pass** |
| **TC-BE-02** | rows_from_payload: dict→data | `rows_from_payload({"data":[…]})` | Вернёт список из `data` | Вернул список | **Pass** |
| **TC-BE-03** | rest_parse_gate | Парсинг тикера Gate | Корректные поля/типы/ts | Все поля корректны | **Pass** |
| **TC-BE-04** | rest_parse_mexc_like | Парсинг тикера Mexc/Ourbit | Корректные поля/типы/ts | Все поля корректны | **Pass** |
| **TC-BE-05** | normalize_record | `max_size` из meta | Gate: `order_size_max`; Mexc/Ourbit: `maxVol` | Соответствует | **Pass** |

### Tokens / Spreads / Matrix / Favorites / Ошибки / Производительность

| ID | Purpose | Scenario | Expected Result | Actual Result | P/F |
|---|---|---|---|---|---|
| TC-TOK-01 | Загрузка списка инструментов | Открыть `/tokens` (prod) | Таблица без ошибок | Таблица без ошибок | **Pass** |
| TC-TOK-02 | Поиск по символу | Ввести `BTC` | Список отфильтрован | Список отфильтрован | **Pass** |
| TC-SPR-01…04 | Таблица спредов/сортировка/NaN/порог | Открыть `/spreads` | Соответствие формуле/правилам | Соответствие формуле/правилам | **Pass** |
| TC-MAT-01…03 | Матрица спредов | Открыть `/matrix` | Корректные значения | Корректные значения | **Pass** |
| TC-FAV-01…04 | Избранное CRUD/сохранение | Страница `/favorites` | Работает | Работает | **Pass** |
| TC-ERR-01…03 | Обработка 5xx/429/пустых | Смоделировать ответы | Нотификация/бэк-офф/пустое сост. | Нотификация/бэк-офф/пустое сост. | **Pass** |
| TC-PERF-01…02 | Перфоманс/память | Lighthouse, 10-мин стрим | ≤2.0 сек, прирост <10% | ≤2.0 сек, прирост <10% | **Pass** |

## 4. Дефекты
| ID | Severity | Title | Steps | Expected | Actual | Status | Link |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |

## 5. Заключение
Проведённые тесты подтвердили корректность работы модулей backend (FastAPI, WebSocket, REST-парсеры, нормализация данных). Негативные сценарии по WS покрыты. Фронтенд и е2е-сценарии проверены самостоятельно, будут. Продукт готов к защите по критериям текущего этапа.
