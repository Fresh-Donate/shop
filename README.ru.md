# FreshDonate - Магазин

> Публичная витрина, через которую игроки выбирают донаты и оплачивают их.

Часть проекта **FreshDonate** - open‑source платформы донатов для Minecraft‑серверов.
См. также: [Backend](https://github.com/Fresh-Donate/backend) · [Админ‑панель](https://github.com/Fresh-Donate/panel) · [Minecraft‑плагин](https://github.com/Fresh-Donate/plugin) · [English README](README.md)

---

## О проекте FreshDonate

FreshDonate - самохостимая система приёма донатов для Minecraft‑серверов. Она позволяет продавать привилегии, предметы, валюту и любые другие внутриигровые товары через собственную витрину, принимать оплату через несколько платёжных систем и автоматически доставлять покупки игрокам при следующем заходе на сервер - без комиссий сторонних сервисов и без вендор‑лока.

Платформа разделена на четыре репозитория:

| Репозиторий | Роль |
| --- | --- |
| [fresh-donate-backend](https://github.com/Fresh-Donate/backend) | Fastify API, платежи, вебхуки, очередь доставки |
| **fresh-donate-shop** *(этот)* | Публичная витрина для игроков (Nuxt) |
| [fresh-donate-panel](https://github.com/Fresh-Donate/panel) | Админка для владельца (Nuxt) |
| [fresh-donate-plugin](https://github.com/Fresh-Donate/plugin) | Плагин Minecraft, выдающий покупки в игре |

## Роль этого репозитория

Магазин - это клиентская часть FreshDonate, то что видит игрок. Здесь игрок:

- смотрит каталог товаров (данные тянутся из бекенда);
- вводит свой ник и email;
- выбирает способ оплаты и уходит на страницу шлюза;
- возвращается на страницу успеха/неудачи и ждёт выдачу в игре.

Вся бизнес‑логика (цены, наличие, создание платежа) лежит на бекенде - сам магазин остаётся тонким, быстрым и SEO‑дружелюбным Nuxt‑приложением.

## Стек

- **Nuxt 4** (Vue 3) - SSR / SSG
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

По умолчанию магазин поднимается на `http://localhost:3002` и ожидает бекенд на `http://localhost:3001`. Адреса переопределяются через переменные окружения (`NUXT_PUBLIC_API_BASE` и другие - см. `nuxt.config.ts`).

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
server/          Nuxt server routes
shared/
  shop-settings.ts  схема настроек магазина
  utils/            общий код app и server
```

## Свои настройки магазина

Форк сам объявляет, какие настройки ему нужны. Панель читает схему с `{shopUrl}/api/settings-schema` и строит по ней страницу «Настройки магазина», бекенд проверяет и хранит значения.

1. Добавьте поле в `shared/shop-settings.ts`:

   ```ts
   { key: 'logo', type: 'image', label: 'Логотип' }
   ```

2. Прочитайте значение в магазине, тип выводится из схемы:

   ```ts
   const logo = useShopField('logo')
   // или
   const settings = useShopSettingsStore()
   settings.fields.logo
   ```

3. Задеплойте магазин. Поле появится в панели, бекенд и панель менять не нужно.

Пока админ не сохранил значение, магазин получает `default` из схемы.

### Типы полей

| `type` | Значение | Свойства |
| --- | --- | --- |
| `text`, `textarea` | `string` | `min`, `max` (длина), `pattern`, `rows` |
| `number` | `number \| null` | `min`, `max`, `step`, `integer` |
| `boolean` | `boolean` | |
| `select` | `string`, при `multiple: true` - `string[]` | `options: [{ value, label }]`, `multiple`, `min`/`max` (сколько выбрать) |
| `color` | `string` | `format: 'hex'` (`#rrggbb`, по умолчанию) или `'tailwind'` (`sky`, `emerald`, ...) |
| `url`, `email` | `string` | |
| `date`, `datetime` | `string` | `date` - `YYYY-MM-DD`, `datetime` - ISO |
| `image` | `string` (URL) | загрузка в панели или ссылка |
| `file` | `string` (URL) | загрузка в панели или ссылка, `accept` |
| `list` | массив объектов | `fields` (любые типы, кроме `list`), `min`, `max`, `titleKey`, `addLabel` |

Общие свойства: `key`, `label`, `description`, `placeholder`, `icon`, `required`, `default`, `visibleIf: { key, equals }` - поле видно, только если другое поле равно `equals` (или одному из значений, если это массив).

Список баннеров:

```ts
{
  key: 'banners',
  type: 'list',
  label: 'Баннеры',
  max: 5,
  titleKey: 'title',
  addLabel: 'Добавить баннер',
  fields: [
    { key: 'title', type: 'text', label: 'Заголовок', required: true },
    { key: 'image', type: 'image', label: 'Картинка', required: true },
    { key: 'link', type: 'url', label: 'Ссылка' }
  ]
}
```

- Значения отдаёт публичный `GET /shop-settings`, секреты в полях не храните.
- `name`, `ip`, `contactEmail` и `cartEnabled` читает бекенд (письма и корзина), тип этих ключей менять нельзя.
- Картинки и файлы загружаются на бекенд, лимит размера - `UPLOADS_MAX_FILE_SIZE` (по умолчанию 10 МБ).

## Скрипты

| Скрипт | Что делает |
| --- | --- |
| `npm run dev` | Dev‑сервер с hot reload |
| `npm run build` | Production SSR‑сборка |
| `npm run generate` | Статическая генерация |
| `npm run preview` | Preview production‑сборки |
| `npm run lint` | ESLint |

## Связанные репозитории

- [fresh-donate-backend](https://github.com/Fresh-Donate/backend) - REST API, с которым работает магазин
- [fresh-donate-panel](https://github.com/Fresh-Donate/panel) - админ‑панель
- [fresh-donate-plugin](https://github.com/Fresh-Donate/plugin) - плагин доставки для Minecraft

## Лицензия

См. [LICENSE](LICENSE).
