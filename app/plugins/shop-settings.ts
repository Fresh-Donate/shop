export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const settings = useShopSettingsStore()
  const appConfig = useAppConfig()

  const { data } = await useAsyncData('shop-settings', () =>
    $fetch<{ name: string, description: string, color: string, ip: string }>('/shop-settings', {
      baseURL: config.public.apiBase as string
    })
  )

  if (data.value) {
    settings.apply(data.value)
    appConfig.ui.colors.primary = data.value.color
  }
})
