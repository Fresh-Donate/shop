<script setup lang="ts">
import type { Product } from '~/stores/products'

const settings = useShopSettingsStore()
const productsStore = useProductsStore()
const cart = useCartStore()
const toast = useToast()
const requestUrl = useRequestURL()

onMounted(() => {
  if (settings.fields.cartEnabled) cart.reconcile(productsStore.items)
})

useShopSeo({
  description: settings.fields.description
    || `Купить донат на сервер ${settings.fields.ip || settings.fields.name}: привилегии, предметы и валюта. Выдача сразу после оплаты.`
})

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
    'name': settings.fields.name,
    'description': settings.fields.description || undefined,
    'url': siteUrl,
    'image': `${siteUrl}/og-image.png`,
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': `${settings.fields.name} - товары`,
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

// Card button: add to cart when the cart feature is on, otherwise fall back to
// the original one-click purchase modal.
function onProductAction(productId: string) {
  if (!settings.fields.cartEnabled) {
    openPurchase(productId)
    return
  }
  const product = productsStore.items.find(p => p.id === productId)
  if (!product) return

  const result = cart.addItem(product)
  if (result.ok) {
    toast.add({
      title: 'Добавлено в корзину',
      description: product.name,
      icon: 'i-lucide-shopping-cart',
      color: 'success'
    })
  } else if (result.reason === 'currency') {
    toast.add({
      title: 'Другая валюта',
      description: 'В корзине уже есть товары в другой валюте. Очистите её, чтобы добавить этот товар.',
      icon: 'i-lucide-triangle-alert',
      color: 'warning'
    })
  } else {
    toast.add({
      title: 'Корзина заполнена',
      description: 'Можно добавить не больше 20 товаров.',
      icon: 'i-lucide-triangle-alert',
      color: 'warning'
    })
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Hero -->
    <ShopHeroBanner
      :title="settings.fields.name"
      :server-ip="settings.fields.ip"
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
        :currency="product.currency"
        :image-url="product.imageUrl"
        :active-promotions="product.activePromotions"
        :discount-percent="product.discountPercent"
        :discounted-price="product.discountedPrice"
        :servers="product.servers"
        :cart-mode="settings.fields.cartEnabled"
        @add-to-cart="onProductAction"
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
