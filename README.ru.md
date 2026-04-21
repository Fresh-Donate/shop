# FreshDonate — Магазин

> Публичная витрина, через которую игроки выбирают донаты и оплачивают их.

Часть проекта **FreshDonate** — open‑source платформы донатов для Minecraft‑серверов.
См. также: [Backend](https://github.com/Fresh-Donate/backend) · [Админ‑панель](https://github.com/Fresh-Donate/panel) · [Minecraft‑плагин](https://github.com/Fresh-Donate/fresh-donate-plugin) · [English README](README.md)

---

## О проекте FreshDonate

FreshDonate — самохостимая система приёма донатов для Minecraft‑серверов. Она позволяет продавать привилегии, предметы, валюту и любые другие внутриигровые товары через собственную витрину, принимать оплату через несколько платёжных систем и автоматически доставлять покупки игрокам при следующем заходе на сервер — без комиссий сторонних сервисов и без вендор‑лока.

Платформа разделена на четыре репозитория:

| Репозиторий | Роль |
| --- | --- |
| [fresh-donate-backend](https://github.com/Fresh-Donate/backend) | Fastify API, платежи, вебхуки, очередь доставки |
| **fresh-donate-shop** *(этот)* | Публичная витрина для игроков (Nuxt) |
| [fresh-donate-panel](https://github.com/Fresh-Donate/panel) | Админка для владельца (Nuxt) |
| [fresh-donate-plugin](https://github.com/Fresh-Donate/fresh-donate-plugin) | Плагин Minecraft, выдающий покупки в игре |

## Роль этого репозитория

Магазин — это клиентская часть FreshDonate, то что видит игрок. Здесь игрок:

- смотрит каталог товаров (данные тянутся из бекенда);
- вводит свой ник и email;
- выбирает способ оплаты и уходит на страницу шлюза;
- возвращается на страницу успеха/неудачи и ждёт выдачу в игре.

Вся бизнес‑логика (цены, наличие, создание платежа) лежит на бекенде — сам магазин остаётся тонким, быстрым и SEO‑дружелюбным Nuxt‑приложением.

## Стек

- **Nuxt 4** (Vue 3) — SSR / SSG
- **Nuxt UI 4** + **Tailwind CSS 4**
- **Pinia** для клиентского состояния
- **@nuxt/icon**, **@nuxt/image** для ассетов
- **TypeScript**

## Требования

- Node.js 20+
- Запущенный [fresh-donate-backend](https://github.com/Fresh-Donate/backend) (REST API)

## Быстрый старт (dev)

```bash
npm install
npm run dev
```

По умолчанию магазин поднимается на `http://localhost:3002` и ожидает бекенд на `http://localhost:3001`. Адреса переопределяются через переменные окружения (`NUXT_PUBLIC_API_BASE` и другие — см. `nuxt.config.ts`).

## Production‑сборка

```bash
npm run build       # SSR‑сборка в .output/
npm run preview     # локальный preview production‑сборки
# или:
npm run generate    # статическая генерация, если SSR не нужен
```

## Docker

В репозитории есть `Dockerfile` и `docker-compose.yml` для запуска магазина за reverse‑proxy вместе с бекендом.

```bash
docker compose up -d --build
```

## Структура проекта

```
app/
  app.vue
  app.config.ts
  assets/        стили, изображения
  components/    UI‑компоненты
  composables/   useApi, useCart, ...
  layouts/       дефолтный layout
  pages/         страницы (index, product/[id], payment/success, ...)
  plugins/       client/server плагины
  stores/        Pinia‑сторы
public/          статические ассеты
server/          Nuxt server routes (если есть)
```

## Скрипты

| Скрипт | Что делает |
| --- | --- |
| `npm run dev` | Dev‑сервер с hot reload |
| `npm run build` | Production SSR‑сборка |
| `npm run generate` | Статическая генерация |
| `npm run preview` | Preview production‑сборки |
| `npm run lint` | ESLint |

## Связанные репозитории

- [fresh-donate-backend](https://github.com/Fresh-Donate/backend) — REST API, с которым работает магазин
- [fresh-donate-panel](https://github.com/Fresh-Donate/panel) — админ‑панель
- [fresh-donate-plugin](https://github.com/Fresh-Donate/fresh-donate-plugin) — плагин доставки для Minecraft

## Лицензия

См. [LICENSE](LICENSE).
