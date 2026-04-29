<script setup lang="ts">
import type { Product } from '~/stores/products'

const settings = useShopSettingsStore()
const productsStore = useProductsStore()
const requestUrl = useRequestURL()

// Base SEO (title / description / OG / Twitter / canonical).
useShopSeo({
  description: settings.description
    || `Купить донат на сервер ${settings.ip || settings.name}: привилегии, предметы, валюта и многое другое. Мгновенная выдача после оплаты.`
})

// JSON-LD: describe the shop as a `Store` and embed the product catalog as
// an `OfferCatalog`. Search engines use this for rich-result eligibility
// and Knowledge Graph hints. Source of truth for the URL is the admin-
// configured `shopUrl`; live origin is the fallback for fresh installs.
const currencyCodes = new Set(['RUB', 'USD', 'EUR'])

const jsonLd = computed(() => {
  const siteUrl = (settings.shopUrl || requestUrl.origin).replace(/\/+$/, '')

  const offers = productsStore.items.map(p => ({
    '@type': 'Offer',
    'name': p.name,
    'description': p.description || undefined,
    'price': Number(p.price).toFixed(2),
    'priceCurrency': currencyCodes.has(p.currency) ? p.currency : 'RUB',
    'image': p.imageUrl || undefined,
    'category': p.type,
    'availability': 'https://schema.org/InStock',
    'url': siteUrl
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    'name': settings.name,
    'description': settings.description || undefined,
    'url': siteUrl,
    'image': `${siteUrl}/og-image.png`,
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': `${settings.name} — товары`,
      'itemListElement': offers
    }
  }
})

useHead({
  script: [{
    type: 'application/ld+json',
    // Stringifying inside `innerHTML` keeps it as a single SSR-rendered tag
    // rather than a parsed JS module. Search engines parse the inner text.
    innerHTML: () => JSON.stringify(jsonLd.value)
  }]
})

const selectedCategory = ref('all')
const purchaseOpen = ref(false)
const purchaseProduct = ref<Product | null>(null)

const currencySymbols: Record<string, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€'
}

const typeLabels: Record<string, string> = {
  item: 'Предметы',
  privilege: 'Привилегии',
  currency: 'Валюта',
  other: 'Другое'
}

const categories = computed(() => {
  const types = new Set(productsStore.items.map(p => p.type))
  return [...types].map(type => ({
    id: type,
    label: typeLabels[type] || type
  }))
})

const filteredProducts = computed(() => {
  return productsStore.items.filter((p) => {
    return !(selectedCategory.value !== 'all' && p.type !== selectedCategory.value)
  })
})

function openPurchase(productId: string) {
  const product = productsStore.items.find(p => p.id === productId)
  if (!product) return
  purchaseProduct.value = product
  purchaseOpen.value = true
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Hero -->
    <ShopHeroBanner
      :title="settings.name"
      :server-ip="settings.ip"
    />

    <!-- Filters -->
    <div
      v-if="categories.length > 1"
      class="flex flex-wrap gap-2"
    >
      <UButton
        :variant="selectedCategory === 'all' ? 'solid' : 'ghost'"
        :color="selectedCategory === 'all' ? 'primary' : 'neutral'"
        size="sm"
        label="Все"
        @click="selectedCategory = 'all'"
      />
      <UButton
        v-for="cat in categories"
        :key="cat.id"
        :variant="selectedCategory === cat.id ? 'solid' : 'ghost'"
        :color="selectedCategory === cat.id ? 'primary' : 'neutral'"
        size="sm"
        :label="cat.label"
        @click="selectedCategory = cat.id"
      />
    </div>

    <!-- Products Grid -->
    <div
      v-if="filteredProducts.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <ShopProductCard
        v-for="product in filteredProducts"
        :id="product.id"
        :key="product.id"
        :name="product.name"
        :price="product.price"
        :quantity="product.quantity"
        :currency="currencySymbols[product.currency] || product.currency"
        :image-url="product.imageUrl"
        :active-promotions="product.activePromotions"
        :discount-percent="product.discountPercent"
        :discounted-price="product.discountedPrice"
        @add-to-cart="openPurchase"
      />
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="text-center py-16"
    >
      <UIcon
        name="i-lucide-package-x"
        class="size-16 text-muted/30 mx-auto"
      />
      <p class="mt-4 text-muted">
        Товары не найдены
      </p>
    </div>

    <!-- Purchase Modal -->
    <ShopPurchaseModal
      v-if="purchaseProduct"
      v-model:open="purchaseOpen"
      :product="purchaseProduct"
    />
  </div>
</template>
