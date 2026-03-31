interface CartItem {
  productId: string
  name: string
  price: number
  currency: string
  quantity: number
  imageUrl?: string
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const totalPrice = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))

  function addItem(product: Omit<CartItem, 'quantity'>) {
    const existing = items.value.find(item => item.productId === product.productId)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }

  function removeItem(productId: string) {
    items.value = items.value.filter(item => item.productId !== productId)
  }

  function clear() {
    items.value = []
  }

  return { items, totalItems, totalPrice, addItem, removeItem, clear }
})
