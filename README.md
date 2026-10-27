# FreshDonate - Shop

> Public storefront where players browse donations and pay.

Part of the **FreshDonate** open‑source donation platform for Minecraft servers.
See also: [Backend](https://github.com/Fresh-Donate/backend) · [Admin Panel](https://github.com/Fresh-Donate/panel) · [Minecraft Plugin](https://github.com/Fresh-Donate/plugin) · [Russian README](README.ru.md)

---

## About FreshDonate

FreshDonate is a self‑hosted donation system for Minecraft servers. It lets you sell ranks, items, currency and any other in‑game goods through your own storefront, accept payments via multiple providers, and deliver purchases to players automatically the next time they are online - without any third‑party commission or lock‑in.

The platform is split into four repositories:

| Repository | Role |
| --- | --- |
| [fresh-donate-backend](https://github.com/Fresh-Donate/backend) | Fastify API, payments, webhooks, delivery queue |
| **fresh-donate-shop** *(this repo)* | Public storefront for players (Nuxt) |
| [fresh-donate-panel](https://github.com/Fresh-Donate/panel) | Admin panel for owners (Nuxt) |
| [fresh-donate-plugin](https://github.com/Fresh-Donate/plugin) | Minecraft plugin that delivers purchases in‑game |

## Role of this repository

The shop is the customer‑facing part of FreshDonate. Players:

- browse the product catalogue fetched from the backend;
- enter their nickname and email;
- pick a payment method and are redirected to the gateway;
- return to the success / failure page and wait for in‑game delivery.

All business logic (pricing, availability, payment creation) lives in the backend - the shop is a thin, fast, SEO‑friendly Nuxt app.

## Tech stack

- **Nuxt 4** (Vue 3) - SSR / SSG
- **Nuxt UI 4** + **Tailwind CSS 4**
- **Pinia** for client state
- **@nuxt/icon**, **@nuxt/image** for assets
- **TypeScript**

## Requirements

- Node.js 20+
- A running [fresh-donate-backend](https://github.com/Fresh-Donate/backend) (REST API)

## Quick start (dev)

```bash
npm install
npm run dev
```

By default the shop runs on `http://localhost:3002` and expects the backend on `http://localhost:3001`. Override via environment variables (`NUXT_PUBLIC_API_BASE` etc. - see `nuxt.config.ts`).

## Build / production

```bash
npm run build       # SSR build (.output/)
npm run preview     # preview production build locally
# or:
npm run generate    # static site if you don't need SSR
```

## Docker

`Dockerfile` and `docker-compose.yml` are included for running the shop behind a reverse proxy together with the backend.

```bash
docker compose up -d --build
```

## Project structure

```
app/
  app.vue
  app.config.ts
  assets/        styles, images
  components/    UI components
  composables/   useApi, useCart, ...
  layouts/       default layout
  pages/         routes (index, product/[id], payment/success, ...)
  plugins/       client/server plugins
  stores/        Pinia stores
public/          static assets
server/          Nuxt server routes
shared/
  shop-settings.ts  shop settings schema
  utils/            code shared by app and server
```

## Custom shop settings

A fork declares the settings it needs. The panel reads the schema from `{shopUrl}/api/settings-schema` and renders the "Shop settings" page from it; the backend validates and stores the values.

1. Add a field to `shared/shop-settings.ts`:

   ```ts
   { key: 'logo', type: 'image', label: 'Logo' }
   ```

2. Read the value in the shop, the type is inferred from the schema:

   ```ts
   const logo = useShopField('logo')
   // or
   const settings = useShopSettingsStore()
   settings.fields.logo
   ```

3. Deploy the shop. The field shows up in the panel, no backend or panel changes needed.

Until the admin saves a value, the shop gets the field's `default`.

### Field types

| `type` | Value | Options |
| --- | --- | --- |
| `text`, `textarea` | `string` | `min`, `max` (length), `pattern`, `rows` |
| `number` | `number \| null` | `min`, `max`, `step`, `integer` |
| `boolean` | `boolean` | |
| `select` | `string`, `string[]` with `multiple: true` | `options: [{ value, label }]`, `multiple`, `min`/`max` (selection count) |
| `color` | `string` | `format: 'hex'` (`#rrggbb`, default) or `'tailwind'` (`sky`, `emerald`, ...) |
| `url`, `email` | `string` | |
| `date`, `datetime` | `string` | `date` is `YYYY-MM-DD`, `datetime` is ISO |
| `image` | `string` (URL) | upload in the panel or a link |
| `file` | `string` (URL) | upload in the panel or a link, `accept` |
| `list` | array of objects | `fields` (any type except `list`), `min`, `max`, `titleKey`, `addLabel` |

Common options: `key`, `label`, `description`, `placeholder`, `icon`, `required`, `default`, `visibleIf: { key, equals }` - the field is shown only when another field equals `equals` (or one of its values when it is an array).

A banner list:

```ts
{
  key: 'banners',
  type: 'list',
  label: 'Banners',
  max: 5,
  titleKey: 'title',
  addLabel: 'Add banner',
  fields: [
    { key: 'title', type: 'text', label: 'Title', required: true },
    { key: 'image', type: 'image', label: 'Image', required: true },
    { key: 'link', type: 'url', label: 'Link' }
  ]
}
```

- Values are served by the public `GET /shop-settings`, don't keep secrets in fields.
- `name`, `ip`, `contactEmail` and `cartEnabled` are read by the backend (emails and cart), their types can't change.
- Images and files are uploaded to the backend, the size limit is `UPLOADS_MAX_FILE_SIZE` (10 MB by default).

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production SSR build |
| `npm run generate` | Static site generation |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Related repositories

- [fresh-donate-backend](https://github.com/Fresh-Donate/backend) - REST API this shop talks to
- [fresh-donate-panel](https://github.com/Fresh-Donate/panel) - admin panel
- [fresh-donate-plugin](https://github.com/Fresh-Donate/plugin) - Minecraft delivery plugin

## License

See [LICENSE](LICENSE).
