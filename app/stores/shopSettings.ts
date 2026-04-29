export type OwnerType = '' | 'individual' | 'self_employed' | 'sole_proprietor' | 'legal_entity'

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
  // Identifying info shown on the public legal pages. All optional —
  // empty string means the admin chose not to disclose.
  ownerName: string
  ownerType: OwnerType
  ownerInn: string
  contactEmail: string
}

export const useShopSettingsStore = defineStore('shopSettings', () => {
  const name = ref('FreshDonate Shop')
  const description = ref('')
  const color = ref('sky')
  const ip = ref('play.example.com')
  const shopUrl = ref('')
  const ownerName = ref('')
  const ownerType = ref<OwnerType>('')
  const ownerInn = ref('')
  const contactEmail = ref('')

  function apply(data: ShopSettingsData) {
    name.value = data.name
    description.value = data.description
    color.value = data.color
    ip.value = data.ip
    shopUrl.value = (data.shopUrl || '').replace(/\/+$/, '')
    ownerName.value = data.ownerName || ''
    ownerType.value = (data.ownerType || '') as OwnerType
    ownerInn.value = data.ownerInn || ''
    contactEmail.value = data.contactEmail || ''
  }

  return {
    name,
    description,
    ip,
    color,
    shopUrl,
    ownerName,
    ownerType,
    ownerInn,
    contactEmail,
    apply
  }
})
