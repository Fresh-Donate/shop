interface ShopSettingsData {
  name: string
  description: string
  ip: string
  color: string
}

export const useShopSettingsStore = defineStore('shopSettings', () => {
  const name = ref('FreshDonate Shop')
  const description = ref('')
  const color = ref('sky')
  const ip = ref('play.example.com')

  function apply(data: ShopSettingsData) {
    name.value = data.name
    description.value = data.description
    color.value = data.color
    ip.value = data.ip
  }

  return { name, description, ip, color, apply }
})
