import type { ShopSettingsFields } from '~/stores/shopSettings'

export function useShopField<K extends keyof ShopSettingsFields>(key: K) {
  const settings = useShopSettingsStore()
  return computed(() => settings.fields[key])
}
