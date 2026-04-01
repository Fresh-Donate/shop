<script setup lang="ts">
const cart = useCartStore()

const selectedServer = ref('all')
const selectedCategory = ref('all')

// Mock data — will be replaced with API calls
const servers = [
  { id: 'survival', label: 'Survival' },
  { id: 'anarchy', label: 'Anarchy' },
  { id: 'skyblock', label: 'SkyBlock' }
]

const categories = [
  { id: 'privileges', label: 'Привилегии' },
  { id: 'resources', label: 'Ресурсы' },
  { id: 'keys', label: 'Ключи' },
  { id: 'cosmetics', label: 'Косметика' }
]

const products = ref([
  { id: '1', name: 'VIP', price: 99, currency: '₽', imageUrl: '', serverId: 'survival', categoryId: 'privileges' },
  { id: '2', name: 'Premium', price: 249, currency: '₽', imageUrl: '', serverId: 'survival', categoryId: 'privileges' },
  { id: '3', name: 'Elite', price: 499, currency: '₽', imageUrl: '', serverId: 'survival', categoryId: 'privileges' },
  { id: '4', name: 'Legend', price: 899, currency: '₽', imageUrl: '', serverId: 'survival', categoryId: 'privileges' },
  { id: '5', name: 'Ultimate', price: 1299, currency: '₽', imageUrl: '', serverId: 'survival', categoryId: 'privileges' },
  { id: '6', name: 'Набор алмазов', price: 49, currency: '₽', imageUrl: '', serverId: 'survival', categoryId: 'resources' },
  { id: '7', name: 'Набор ресурсов', price: 149, currency: '₽', imageUrl: '', serverId: 'anarchy', categoryId: 'resources' },
  { id: '8', name: 'Золотой ключ', price: 79, currency: '₽', imageUrl: '', serverId: 'skyblock', categoryId: 'keys' },
  { id: '9', name: 'Алмазный ключ', price: 199, currency: '₽', imageUrl: '', serverId: 'skyblock', categoryId: 'keys' }
])

const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    if (selectedServer.value !== 'all' && p.serverId !== selectedServer.value) return false
    if (selectedCategory.value !== 'all' && p.categoryId !== selectedCategory.value) return false
    return true
  })
})

function handleAddToCart(productId: string) {
  const product = products.value.find(p => p.id === productId)
  if (!product) return
  cart.addItem({
    productId: product.id,
    name: product.name,
    price: product.price,
    currency: product.currency,
    imageUrl: product.imageUrl
  })
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Hero -->
    <ShopHeroBanner
      title="Не сервер, а мечта!"
      server-ip="play.example.com"
    />

    <!-- Filters -->
    <ShopFilterBar
      v-model:server="selectedServer"
      v-model:category="selectedCategory"
      :servers="servers"
      :categories="categories"
    />

    <!-- Products Grid -->
    <div
      v-if="filteredProducts.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <ShopProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :id="product.id"
        :name="product.name"
        :price="product.price"
        :currency="product.currency"
        :image-url="product.imageUrl"
        @add-to-cart="handleAddToCart"
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
  </div>
</template>
