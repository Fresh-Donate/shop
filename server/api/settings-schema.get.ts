import { shopSettingsSchema } from '#shared/shop-settings'

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache'
  })

  return shopSettingsSchema
})
