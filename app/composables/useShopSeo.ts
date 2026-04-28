/**
 * Reactive SEO helper for shop pages.
 *
 * Reads the shop name / description from the settings store (already
 * populated server-side by `plugins/shop-settings.ts`) and registers all
 * the meta tags search engines and link unfurlers care about:
 *   - <title> + meta description
 *   - canonical link
 *   - Open Graph (Facebook / VK / Telegram / Discord)
 *   - Twitter Card
 *   - theme-color from the configured primary color
 *
 * Designed to be called from `setup` — that way the tags end up in the SSR
 * HTML payload, not just in the client DOM.
 */

interface UseShopSeoOptions {
  /** Override the default title (which is `settings.name`). */
  title?: string
  /** Override the default description. */
  description?: string
  /** Path-only override for the canonical URL. Defaults to current route path. */
  path?: string
  /** Absolute or path-relative image URL for OG/Twitter. */
  image?: string
  /**
   * Override `robots`. Use `'noindex, nofollow'` on payment / account pages
   * so they don't end up in search results.
   */
  robots?: string
}

export function useShopSeo(options: UseShopSeoOptions = {}) {
  const settings = useShopSettingsStore()
  const route = useRoute()
  const requestUrl = useRequestURL()

  // The shop's public URL is configured in admin → shop settings and lives in
  // the database. We fall back to the live request origin when the field is
  // empty (e.g. fresh install, admin hasn't filled it yet) so SEO degrades
  // gracefully instead of producing `undefined/...` URLs.
  const siteUrl = computed(() =>
    (settings.shopUrl || requestUrl.origin).replace(/\/+$/, '')
  )

  const title = computed(() => options.title ?? settings.name)
  const description = computed(() => {
    if (options.description) return options.description
    if (settings.description) return settings.description
    return `Донат-магазин ${settings.name}${settings.ip ? ` для сервера ${settings.ip}` : ''}`
  })

  const canonical = computed(() => `${siteUrl.value}${options.path ?? route.path}`)

  const image = computed(() => {
    if (!options.image) return `${siteUrl.value}/og-image.png`
    if (/^https?:\/\//i.test(options.image)) return options.image
    return `${siteUrl.value}${options.image.startsWith('/') ? '' : '/'}${options.image}`
  })

  useSeoMeta({
    title: () => title.value,
    description: () => description.value,
    robots: () => options.robots ?? 'index, follow',

    // Open Graph
    ogType: 'website',
    ogTitle: () => title.value,
    ogDescription: () => description.value,
    ogUrl: () => canonical.value,
    ogImage: () => image.value,
    ogSiteName: () => settings.name,
    ogLocale: 'ru_RU',

    // Twitter Card
    twitterCard: 'summary_large_image',
    twitterTitle: () => title.value,
    twitterDescription: () => description.value,
    twitterImage: () => image.value
  })

  useHead({
    link: [
      { rel: 'canonical', href: () => canonical.value }
    ],
    meta: [
      // Tracks the configured primary color, falling back to a sensible blue.
      { name: 'theme-color', content: () => themeColorHex(settings.color) }
    ]
  })

  return { title, description, canonical, image }
}

/**
 * Map @nuxt/ui color tokens to a hex color for the `theme-color` meta tag.
 * Only common ones — falls back to a generic primary blue.
 */
function themeColorHex(color: string): string {
  const map: Record<string, string> = {
    sky: '#0ea5e9',
    blue: '#3b82f6',
    indigo: '#6366f1',
    violet: '#8b5cf6',
    purple: '#a855f7',
    fuchsia: '#d946ef',
    pink: '#ec4899',
    rose: '#f43f5e',
    red: '#ef4444',
    orange: '#f97316',
    amber: '#f59e0b',
    yellow: '#eab308',
    lime: '#84cc16',
    green: '#22c55e',
    emerald: '#10b981',
    teal: '#14b8a6',
    cyan: '#06b6d4'
  }
  return map[color] ?? '#0ea5e9'
}
