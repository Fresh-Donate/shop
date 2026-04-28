/**
 * Dynamic robots.txt.
 *
 * Allows everything except per-user payment pages (`/payment/*`) and points
 * crawlers at the sitemap built from the admin-configured shop URL.
 */
export default defineEventHandler(async (event) => {
  const siteUrl = await resolveSiteUrl(event)

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
