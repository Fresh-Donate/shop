# FreshDonate — Shop

> Public storefront where players browse donations and pay.

Part of the **FreshDonate** open‑source donation platform for Minecraft servers.
See also: [Backend](https://github.com/Fresh-Donate/backend) · [Admin Panel](https://github.com/Fresh-Donate/panel) · [Minecraft Plugin](https://github.com/Fresh-Donate/fresh-donate-plugin) · [Russian README](README.ru.md)

---

## About FreshDonate

FreshDonate is a self‑hosted donation system for Minecraft servers. It lets you sell ranks, items, currency and any other in‑game goods through your own storefront, accept payments via multiple providers, and deliver purchases to players automatically the next time they are online — without any third‑party commission or lock‑in.

The platform is split into four repositories:

| Repository | Role |
| --- | --- |
| [fresh-donate-backend](https://github.com/Fresh-Donate/backend) | Fastify API, payments, webhooks, delivery queue |
| **fresh-donate-shop** *(this repo)* | Public storefront for players (Nuxt) |
| [fresh-donate-panel](https://github.com/Fresh-Donate/panel) | Admin panel for owners (Nuxt) |
| [fresh-donate-plugin](https://github.com/Fresh-Donate/fresh-donate-plugin) | Minecraft plugin that delivers purchases in‑game |

## Role of this repository

The shop is the customer‑facing part of FreshDonate. Players:

- browse the product catalogue fetched from the backend;
- enter their nickname and email;
- pick a payment method and are redirected to the gateway;
- return to the success / failure page and wait for in‑game delivery.

All business logic (pricing, availability, payment creation) lives in the backend — the shop is a thin, fast, SEO‑friendly Nuxt app.

## Tech stack

- **Nuxt 4** (Vue 3) — SSR / SSG
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

By default the shop runs on `http://localhost:3002` and expects the backend on `http://localhost:3001`. Override via environment variables (`NUXT_PUBLIC_API_BASE` etc. — see `nuxt.config.ts`).

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
server/          Nuxt server routes (if any)
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production SSR build |
| `npm run generate` | Static site generation |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## Related repositories

- [fresh-donate-backend](https://github.com/Fresh-Donate/backend) — REST API this shop talks to
- [fresh-donate-panel](https://github.com/Fresh-Donate/panel) — admin panel
- [fresh-donate-plugin](https://github.com/Fresh-Donate/fresh-donate-plugin) — Minecraft delivery plugin

## License

See [LICENSE](LICENSE).
