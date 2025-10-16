%%{init: {'theme':'neutral'}}%%
usecaseDiagram
title Futures Arbitrage Radar — Use Cases

actor "Гость" as Guest
actor "Зарегистрированный\nпользователь" as Reg
actor "Биржевые API\n(OKX/Bybit/…)" as ExAPI

rectangle "Futures Arbitrage Radar" {
  usecase "Поиск токена" as UC_Search
  usecase "Просмотр спредов" as UC_Spreads
  usecase "Просмотр биржи" as UC_Exchange
  usecase "Фильтрация/сортировка" as UC_Filter
  usecase "Просмотр статусов\nдепозитов/выводов" as UC_Status

  usecase "Добавить токен\nв избранное" as UC_FavAdd
  usecase "Удалить токен\nиз избранного" as UC_FavRemove
  usecase "Экспорт таблицы (CSV)" as UC_Export

  usecase "Вход/Регистрация" as UC_Login
  usecase "Выход" as UC_Logout
}

Guest --> UC_Search
Guest --> UC_Spreads
Guest --> UC_Exchange
Guest --> UC_Filter
Guest --> UC_Status

Reg --> UC_FavAdd
Reg --> UC_FavRemove
Reg --> UC_Export
Reg --> UC_Login
Reg --> UC_Logout

UC_Search <-- ExAPI
UC_Spreads <-- ExAPI
UC_Exchange <-- ExAPI
UC_Status <-- ExAPI
