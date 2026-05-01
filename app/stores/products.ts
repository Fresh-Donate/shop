export interface ProductPromotion {
  id: string
  name: string
  discountPercent: number
}

export interface ProductGroup {
  id: string
  name: string
  upgradeMode: boolean
}

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
  /** Promotions currently in effect on this product. */
  activePromotions?: ProductPromotion[]
  /** Stacked discount %, capped at 100. */
  discountPercent?: number
  /** Price after `discountPercent` is applied (== `price` when no discount). */
  discountedPrice?: number
  /** Groups the product belongs to (used by upgrade-mode preview UI). */
  groups?: ProductGroup[]
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
