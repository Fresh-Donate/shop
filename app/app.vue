<script setup lang="ts">
const settings = useShopSettingsStore()

// Site-wide head defaults. Pages that call `useShopSeo` override the title
// and description; this just sets the language, default suffix, and a base
// favicon link.
useHead({
  htmlAttrs: { lang: 'ru' },
  titleTemplate: (chunk?: string) => {
    const name = settings.name || 'FreshDonate Shop'
    if (!chunk || chunk === name) return name
    return `${chunk} — ${name}`
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
