<script setup lang="ts">
const settings = useShopSettingsStore()

useHead({
  htmlAttrs: { lang: 'ru' },
  titleTemplate: (chunk?: string) => {
    const name = settings.fields.name || 'FreshDonate Shop'
    if (!chunk || chunk === name) return name
    return `${chunk} - ${name}`
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

const colorMode = useColorMode()
colorMode.preference = 'dark'
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
