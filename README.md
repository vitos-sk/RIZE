# FokusTracker (RIZE)

Геймифицированный трекер задач, целей и привычек: галочка → +XP → уровень и стрик растут →
график вверх. Single-user, без бэкенда — Next.js + Firebase (Firestore + Auth).

## Локальный запуск

```bash
npm install
cp .env.local.example .env.local   # заполнить ключами своего Firebase-проекта
npm run dev                        # http://localhost:3000
```

Проверка перед деплоем:

```bash
npm run lint
npm run build
```

## Переменные окружения

Все шесть переменных обязательны — без них Firebase SDK падает на инициализации:

| Переменная | Где взять |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project settings → Your apps → SDK setup |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | там же |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | там же |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | там же |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | там же |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | там же |

Префикс `NEXT_PUBLIC_` означает, что значения попадают в клиентский бандл. Для Firebase Web SDK
это штатно: доступ к данным ограничивают Firestore Security Rules (`firestore.rules`), а не
секретность ключа.

## Деплой на Vercel

1. Импортировать репозиторий на [vercel.com/new](https://vercel.com/new). Framework определится
   как Next.js, команды сборки менять не нужно.
2. В **Settings → Environment Variables** добавить все шесть переменных для окружений
   Production, Preview и Development.
3. Задеплоить и скопировать выданный домен (`<project>.vercel.app`).
4. **Firebase Console → Authentication → Settings → Authorized domains** — добавить этот домен,
   иначе вход по email/паролю на проде вернёт `auth/unauthorized-domain`.
5. **Firebase Console → Firestore → Rules** — вставить содержимое `firestore.rules` и нажать
   Publish (по умолчанию правила тестового режима протухают и закрывают доступ).

Каждый push в `main` триггерит новый production-деплой, ветки и PR получают preview-деплои.
