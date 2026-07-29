@AGENTS.md

# FokusTracker

Геймифицированный трекер задач, целей и привычек. Одна фраза: **галочка → +XP → цифра
и стрик растут → график вверх → не хочешь ломать серию → возвращаешься завтра.**
Single-user (личный трекер), без мультиюзера/команды.

## Стек

- Next.js (App Router) + React 19 + TypeScript + Tailwind CSS v4 (CSS-first тема в `globals.css`)
- Firebase: Firestore + Authentication (клиентский SDK, без отдельного бэкенда)
- Recharts — графики
- lucide-react — иконки (таб-бар, KPI, кнопки)
- Zod — валидация форм на клиенте
- PWA (манифест уже подключён через `app/manifest.ts`)
- Хостинг: Vercel

Дизайн интерфейса — свой (не сгенерированный), макеты/промты приходят из отдельного чата и
реализуются экран за экраном. UI-текст во всех экранах — на русском (Главная, Задачи,
Задачи на сегодня, УР. ...); английские варианты (Home, Tasks, LVL...) были в ходу раньше,
но от этой конвенции отказались — держать интерфейс полностью русским для нового UI.
Плейсхолдеры ещё не свёрстанных экранов остаются на русском (см. `PagePlaceholder`) до тех
пор, пока для них не пришёл реальный дизайн.
Root layout оборачивает приложение в "телефонную" рамку (`max-w-107.5`, border/shadow на
десктопе) — это сделано намеренно, не убирать.

## Архитектура папок (`src/`)

```
app/
  layout.tsx            — root layout (html/body, шрифты, viewport, metadata)
  manifest.ts            — PWA-манифест
  globals.css             — тема Tailwind v4 (@theme: --color-bg/card/border/fg/muted/gold/success/danger)
  (main)/                 — группа роутов с нижним таб-баром
    layout.tsx            — оборачивает страницы в <TabBar/>
    page.tsx               — Главная / Dashboard  → "/"  (РЕАЛИЗОВАН, см. components/dashboard)
    tasks/page.tsx          → "/tasks"    (РЕАЛИЗОВАН, см. components/tasks)
    calendar/page.tsx        → "/calendar"  (заглушка — месячная сетка, см. types/calendar.ts)
    habits/page.tsx           → "/habits"   (заглушка)
    stats/page.tsx             → "/stats"    (заглушка)
    goals/page.tsx               → "/goals"  (v2, вне таб-бара, доступен по прямой ссылке)
    profile/page.tsx              → "/profile" (заглушка)
  (auth)/                  — группа без таб-бара
    layout.tsx
    login/page.tsx           → "/login"  (заглушка)
components/
  ui/page-placeholder.tsx    — общий "пустой" экран-заглушка (title + description)
  layout/tab-bar.tsx          — "use client" нижняя навигация (6 вкладок, lucide-react иконки)
  dashboard/                   — РЕАЛЬНЫЕ компоненты Dashboard (score-header, stats-row,
                                  productivity-chart, today-tasks) — уже свёрстаны по дизайну
lib/
  firebase/config.ts          — initializeApp/getAuth/getFirestore из NEXT_PUBLIC_FIREBASE_*
  logic/xp.ts                  — xpForCompletion, penaltyForMissedDaily, levelFromXP
  logic/streak.ts               — updateStreakOnCompletion (чистые функции, легко тестировать)
  logic/calendar.ts              — buildMonthGrid(year, month, logsByDate, tasksByDate, todayKey)
                                    → MonthGrid (недели по 7 дней, статус дня, XP); чистая
                                    функция без вёрстки — UI календаря ещё не реализован
types/
  task.ts, goal.ts, log.ts, user.ts, calendar.ts, index.ts — типы Firestore-схемы и календаря
```

Экраны, кроме Dashboard, — заглушки через `PagePlaceholder`. Наполнять реальным UI по мере
готовности макетов из отдельного дизайн-чата; вёрстку заглушек не превращать в финальный дизайн
без явного запроса — для новых экранов (как Calendar) готовить только архитектуру
(роут + типы + бизнес-логика), саму вёрстку экрана делать только когда явно попросят.

## Модель данных Firestore (`users/{uid}/...`)

```
users/{uid}: displayName, createdAt, totalXP, level, currentStreak, longestStreak,
             lastActiveDate ('YYYY-MM-DD'), gold
tasks/{taskId}: title, category, type ('once'|'daily'|'habit'), isNegative, priority (1-4),
                schedule (string[]), dueDate, done, doneAt, createdAt
goals/{goalId}: title, target, progress, deadline, linkedTaskIds, createdAt
logs/{logId}: taskId, date, type, xp, onTime, createdAt   ← ГЛАВНАЯ коллекция для графиков
```

> Вся аналитика и графики считаются только по `logs`. Никогда не агрегировать по `tasks`.

## Формулы (уже реализованы в `lib/logic`)

```ts
xpForCompletion(task, onTime)     // base по priority (P1=25..P4=10), *0.5 если не вовремя,
                                   // отрицательный если isNegative
penaltyForMissedDaily(task)        // -round(base * 0.6), начисляется раз в сутки при заходе
levelFromXP(totalXP)                // floor(sqrt(max(0, totalXP) / 50)) — минус XP не даёт NaN
xpForLevel(level)                    // 50 * level² — порог входа в уровень
levelProgress(totalXP)                // { level, xpIntoLevel, xpPerLevel, xpToNext, percent }
                                       // для XP-бара в ScoreHeader
updateStreakOnCompletion(state, today) // стрик по lastActiveDate, честно сбрасывается в 1
```

Score за период на графике = сумма `xp` из `logs` за период — должен уметь уходить в минус,
это осознанная фича, не баг.

## Главный график продуктивности

Composed chart (Recharts): столбики = кол-во выполненных задач в день, линия = сумма xp
(score) за день, с переключателем период День/Неделя/Месяц, стрелкой тренда и сравнением
с прошлым периодом (пунктир).

На Главной реализован (`components/dashboard/productivity-chart.tsx` + `logic/dashboard.ts`):
переключатель периода (`buildPeriodChart` — день = 6 корзин по 4 часа по `log.createdAt`,
неделя = 7 дней, месяц = 4 недели) и стрелка тренда против предыдущего такого же периода.
Страница подписана на 56 дней логов — этого хватает и на месяц, и на его сравнение.
Пунктир прошлого периода живёт только на экране Статистики (`components/stats`), который
пока сидит на моках.

## Окружение

- Скопировать `.env.local.example` → `.env.local`, заполнить ключи Firebase-проекта.
- `.env*` в `.gitignore` — реальные ключи никогда не коммитить.

## Известные TODO

- PWA-иконки (192/512 px) — сейчас манифест ссылается только на `favicon.ico`, нужны
  нормальные иконки из финального дизайна.
- Firestore Security Rules написаны (`firestore.rules`, `uid == request.auth.uid`), но пока
  не опубликованы в Firebase Console → Firestore → Rules — нужно вставить и нажать Publish.
- Auth-флоу (`/login`) подключён к Firebase Auth: Email/Password (вход, регистрация, выход,
  защита `(main)`-роутов через `AuthGate`). Вход через Google/Apple/Анонимно убран из макета
  (не нужен для MVP).
- Dashboard читает реальные `tasks`/`logs`/`users` из Firestore вместо моков. Экран Tasks
  (`components/tasks/tasks-screen.tsx` + `add-task-sheet.tsx`) тоже на Firestore: список через
  `subscribeAllTasks`, галочка через `completeTask`/`uncompleteTask`, кнопка "+" создаёт задачу
  через `createTask` (тип, категория, приоритет, дедлайн, флаг "плохая привычка").
  Habits — всё ещё на локальных моках.
- Нет UI для редактирования и удаления задач — создать можно, убрать нельзя (только из
  Firebase Console).
- Полный список функций/фич — см. исходный бриф проекта (MVP и v2) в истории чата или
  восстановить по `UI_PROMPTS.md`.
