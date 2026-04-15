<script setup lang="ts">
import type { Product } from '~/stores/products'

const settings = useShopSettingsStore()
const productsStore = useProductsStore()

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
    if (selectedCategory.value !== 'all' && p.type !== selectedCategory.value) return false
    return true
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
