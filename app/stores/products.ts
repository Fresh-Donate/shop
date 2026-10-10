export interface ProductPromotion {
  id: string
  name: string
  discountPercent: number
}

export interface ProductServer {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  price: number
  currency: string
  quantity: number
  description: string
  type: string
  imageUrl?: string
  allowCustomCount: boolean
  activePromotions?: ProductPromotion[]
  discountPercent?: number
  discountedPrice?: number
  servers?: ProductServer[]
}

export const useProductsStore = defineStore('products', () => {
  const items = ref<Product[]>([])

  function apply(data: Product[]) {
    items.value = data
  }

  return { items, apply }
})
