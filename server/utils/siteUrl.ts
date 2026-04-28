import type { H3Event } from 'h3'

/**
 * Resolve the shop's public origin for use in Nitro server routes
 * (robots.txt, sitemap.xml, etc.) where Pinia is not available.
 *
 * The source of truth is `shopUrl` on the admin-configured shop settings,
 * fetched from the backend. If the backend is unreachable or the field is
 * empty (e.g. fresh install), we fall back to the live request origin so
 * SEO assets still produce sensible URLs instead of `undefined/...`.
 *
 * Result has no trailing slash.
 */
export async function resolveSiteUrl(event: H3Event): Promise<string> {
  const config = useRuntimeConfig()
  const apiBase = String(config.public.apiBase || '')

  let shopUrl = ''
  try {
    const data = await $fetch<{ shopUrl?: string }>('/shop-settings', {
      baseURL: apiBase
    })
    shopUrl = (data?.shopUrl || '').trim()
  } catch {
    // Backend unreachable — fall through to request-origin fallback.
  }

  if (!shopUrl) {
    const reqUrl = getRequestURL(event)
    shopUrl = reqUrl.origin
  }

  return shopUrl.replace(/\/+$/, '')
}
