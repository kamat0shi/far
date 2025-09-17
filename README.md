# Futures Arbitrage Radar

Веб-приложение для отслеживания цен фьючерсных токенов на различных криптобиржах и выявления арбитражных возможностей.

**Тип проекта:** Web-приложение  
**Язык разработки:** Backend — Python (FastAPI), Frontend — TypeScript (React + Vite + Tailwind)  
**База данных:** PostgreSQL (кэш метаданных), Redis (стриминг котировок)  
**Интерфейс:** RU/EN, светлая и тёмная темы  

---

## Документация

- [SRS (требования)](docs/SRS.md)  
- [Мокапы интерфейса](docs/mockups/)  
- [Диаграммы](docs/diagrams/)  

---

## Код

- [Backend (Python, FastAPI)](code/backend/)  
- [Frontend (React + TypeScript)](code/frontend/)  

---

## Используемые паттерны и подходы

- **Repository & Unit of Work** — работа с базой данных  
- **Observer** — обновление данных котировок через WebSocket  
- **Adapter** — интеграция с API бирж  
- **MVC / SPA** — структура фронтенда  

---

## Тестирование

- [План тестирования](docs/Test_plan.md)  
- [Результаты тестирования](docs/Test_results.md)  
