export interface Product {
  id: string
  name: string
  price: number
  currency: string
  quantity: number
  description: string
  type: string
  commands: string[]
  imageUrl?: string
  allowCustomCount: boolean
  createdAt: string
  updatedAt: string
}

export const useProductsStore = defineStore('products', () => {
  const items = ref<Product[]>([])

  function apply(data: Product[]) {
    items.value = data
  }

  return { items, apply }
})
