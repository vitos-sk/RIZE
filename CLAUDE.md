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

### Палитра: однотонная, один акцент

База — тёплый графит (`--color-bg: #0c0b0a`, `--color-card: #171513`), без синевы.
Акцент ровно один — золото; всё «хорошее» (выполнено, стрик, заработанный XP, активная
вкладка, линия графика) показывается им. Второй и последний цвет — `--color-danger`:
только отрицательный XP, просрочка, срыв привычки и выход/удаление. **Зелёного
(`--color-success`) в теме больше нет** — его убрали намеренно, не возвращать.

Категории и приоритеты цветом не кодируются: `category-style.ts` отдаёт нейтральные
классы, а приоритет читается градацией непрозрачности белого (P1 `bg-white/70` → P4
`bg-white/15`). Палитр вида `bg-purple-500/15` в `src/` быть не должно — если нужен
ещё один уровень иерархии, это оттенок белого, а не новый цвет.

`.app-aurora` — одно золотое пятно сверху и одно нейтральное снизу; больше цветных
градиентов в фон не добавлять, именно они делали интерфейс пёстрым.

### Матовое стекло (глассморфизм)

Все поверхности приложения — блоки, списки, чипы, бары, шторки, поля — построены на общем
наборе классов из `globals.css` (слой `@layer components`), а не на `bg-card`/`border-border`:

- `.glass` — основная карточка (blur 16px, полупрозрачный фон, светлая грань + внутренний блик)
- `.glass-soft` — вложенные поверхности: строки списков, ячейки календаря, фильтр-чипы
- `.glass-bar` — таб-бар и bottom sheets (blur 26px — под ними едет контент)
- `.glass-chip` — только blur + блик, фон берётся из цветной утилиты рядом (`bg-gold/15` и т.п.)
- `.glass-inset` — "углубление" для треков прогресс-баров
- `.glass-field` — поля ввода (фокус подсвечивает грань золотом)
- `.glass-gold` — золотое стекло для главных действий (FAB, "Добавить", "Войти")

Правила: цвет грани/фона поверх стекла задаётся обычными утилитами Tailwind (`border-gold/60`,
`bg-gold/15`) — слой utilities перебивает components, так что акценты работают поверх `.glass*`.
Свечение под стеклом даёт `.app-aurora` — слой радиальных градиентов в root layout; без него
блюру нечего размывать, поэтому фон не делать плоским. Таб-бар позиционирован `absolute`
поверх контента, поэтому все экраны держат нижний отступ `pb-28`, а плавающие FAB — `bottom-28`.

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
    calendar/page.tsx        → "/calendar"  (РЕАЛИЗОВАН — месячная сетка на Firestore,
                                              см. components/calendar + logic/calendar.ts)
    habits/page.tsx           → "/habits"   (заглушка)
    stats/page.tsx             → "/stats"    (РЕАЛИЗОВАН, см. components/stats + logic/stats.ts)
    goals/page.tsx               → "/goals"  (v2, вне таб-бара, доступен по прямой ссылке)
    profile/page.tsx              → "/profile" (заглушка)
  (auth)/                  — группа без таб-бара
    layout.tsx
    login/page.tsx           → "/login"  (заглушка)
components/
  ui/page-placeholder.tsx    — общий "пустой" экран-заглушка (title + description)
  layout/tab-bar.tsx          — "use client" нижняя навигация (6 вкладок, lucide-react иконки)
  dashboard/                   — РЕАЛЬНЫЕ компоненты Dashboard (today-tasks, kpi-row)
  tasks/task-compose-flow.tsx   — ЕДИНАЯ форма создания задачи для /tasks и /calendar
lib/
  firebase/config.ts          — initializeApp/getAuth/getFirestore из NEXT_PUBLIC_FIREBASE_*
  logic/xp.ts                  — xpForCompletion, penaltyForMissedDaily, levelFromXP
  logic/streak.ts               — updateStreakOnCompletion (чистые функции, легко тестировать)
  logic/calendar.ts              — buildMonthGrid(year, month, logsByDate, tasksByDate, todayKey)
                                    → MonthGrid (недели по 7 дней, статус дня, XP); чистая
                                    функция без вёрстки — UI календаря ещё не реализован
  logic/stats.ts                  — buildStatsScreen(logs, tasks, period, now) → всё, что
                                     показывает экран Статистики (график + пунктир прошлого
                                     периода, тренд, лучший/худший день, категории)
  logic/date.ts                    — toDateKey/fromDateKey, weekdayLabel/weekdayFullLabel,
                                      formatDayMonth/formatDateRange (даты живут в UTC)
  logic/period.ts                   — примитивы скользящих окон (sumXP, logsBetween, shiftKey,
                                       trendPercent, PERIOD_DAYS); общие для Главной и Статистики,
                                       отдельный модуль, чтобы dashboard.ts и stats.ts не
                                       импортировали друг друга
  logic/dashboard.ts                 — buildDashboardKpi(logs, tasks, period) → KPI Главной
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

Живёт ТОЛЬКО на экране Статистики (`components/stats` + `logic/stats.ts`) — с Главной график
убран намеренно, обратно не возвращать. На Главной вместо него KPI-строка
(`components/dashboard/kpi-row.tsx` + `buildDashboardKpi`): «выполнено» (кол-во логов за
период), «не успел» (плановые вхождения задач минус выполненные — через `plannedOccurrences`
из `logic/stats.ts`, без дублирования формулы) и «средний рост» (средний XP в день + % к
предыдущему такому же окну), с тем же переключателем `components/stats/period-tabs.tsx`.
Обе страницы подписаны на 56 дней логов — этого хватает и на месяц, и на его сравнение.
Окна везде скользящие и заканчиваются сегодняшним днём (неделя = последние 7 дней, а не
календарная), сравнение — с таким же окном, сдвинутым назад.

## Задачи: приоритет, архив, создание

- Звёздочка в списке задач = приоритет P1 (`setTaskPriority`, повторный клик возвращает 3).
  P1-задача всплывает наверх и получает золотую грань. Отдельного поля "избранное" нет.
- Выполненная задача сразу уезжает в свёрнутый блок «Выполнено N»: на Главной под списком,
  на /tasks — общим блоком внизу, вне категорий (счётчик у категории считает и выполненные).
- Создание задачи — один компонент `components/tasks/task-compose-flow.tsx` на /tasks и
  /calendar: шаги день (сетка месяца или «Без конкретного дня») → категория (+«Своё») →
  детали (название, тип, приоритет, «плохая привычка»). `initialDate` пропускает первый шаг,
  когда форму открыли из конкретного дня календаря.

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
  (`components/tasks/tasks-screen.tsx` + `task-compose-flow.tsx`) тоже на Firestore: список через
  `subscribeAllTasks`, галочка через `completeTask`/`uncompleteTask`, кнопка "+" создаёт задачу
  через `createTask` (тип, категория, приоритет, дедлайн, флаг "плохая привычка").
  Habits — всё ещё на локальных моках.
- Экран Статистики на Firestore (`subscribeRecentLogs` + `subscribeAllTasks`). "Выполнение по
  категориям": `done` — по логам, `total` — плановые вхождения задачи в окно по её `schedule`
  (для `once` — по `dueDate`), плохие привычки (`isNegative`) из категорий исключены.
  Кнопка "Фильтр" в шапке пока декоративная — для неё ещё нет дизайна.
- Нет UI для редактирования и удаления задач — создать можно, убрать нельзя (только из
  Firebase Console).
- Полный список функций/фич — см. исходный бриф проекта (MVP и v2) в истории чата или
  восстановить по `UI_PROMPTS.md`.
