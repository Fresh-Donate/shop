import { shopSettingsSchema } from '#shared/shop-settings'

export type SupportedCurrency = 'RUB' | 'USD' | 'EUR'
export type CurrencyRates = Partial<Record<SupportedCurrency, number>>
export type ShopSettingsFields = ShopSettingsValues<typeof shopSettingsSchema>

export interface ShopSettingsData {
  shopUrl?: string
  fields?: Record<string, unknown>
  baseCurrency?: SupportedCurrency
  currencyRates?: CurrencyRates
}

export const useShopSettingsStore = defineStore('shopSettings', () => {
  const fields = ref<ShopSettingsFields>(resolveShopFields(shopSettingsSchema, {}))
  const shopUrl = ref('')
  const baseCurrency = ref<SupportedCurrency>('RUB')
  const currencyRates = ref<CurrencyRates>({ USD: 95, EUR: 100 })

  function apply(data: ShopSettingsData) {
    // Older backends have no `fields` and send the same keys flat.
    fields.value = resolveShopFields(shopSettingsSchema, data.fields ?? data)
    shopUrl.value = (data.shopUrl || '').replace(/\/+$/, '')
    if (data.baseCurrency) baseCurrency.value = data.baseCurrency
    if (data.currencyRates) currencyRates.value = data.currencyRates
  }

  return {
    fields,
    shopUrl,
    baseCurrency,
    currencyRates,
    apply
  }
})
