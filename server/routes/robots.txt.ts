/**
 * Dynamic robots.txt.
 *
 * Allows everything except per-user payment pages (`/payment/*`) and points
 * crawlers at the sitemap built from the configured `siteUrl`.
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl || '').replace(/\/+$/, '')

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return [
    'User-agent: *',
    'Disallow: /payment/',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    ''
  ].join('\n')
})
