interface ShopSettingsData {
  name: string
  description: string
  ip: string
  color: string
  /**
   * Public origin of the shop (e.g. `https://shop.example.com`).
   * Source of truth for SEO canonical / OG / sitemap URLs. No trailing slash.
   */
  shopUrl: string
}

export const useShopSettingsStore = defineStore('shopSettings', () => {
  const name = ref('FreshDonate Shop')
  const description = ref('')
  const color = ref('sky')
  const ip = ref('play.example.com')
  const shopUrl = ref('')

  function apply(data: ShopSettingsData) {
    name.value = data.name
    description.value = data.description
    color.value = data.color
    ip.value = data.ip
    shopUrl.value = (data.shopUrl || '').replace(/\/+$/, '')
  }

  return { name, description, ip, color, shopUrl, apply }
})
