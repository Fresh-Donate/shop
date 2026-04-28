/**
 * Dynamic sitemap.xml.
 *
 * The shop currently has a single indexable route (the storefront `/`).
 * Payment status pages are deliberately excluded — they're per-user and
 * already marked `noindex`. If new public pages are added, list them here.
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = String(config.public.siteUrl || '').replace(/\/+$/, '')
  const lastmod = new Date().toISOString().slice(0, 10)

  const urls: Array<{ loc: string, changefreq: string, priority: string }> = [
    { loc: `${siteUrl}/`, changefreq: 'daily', priority: '1.0' }
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return body
})
