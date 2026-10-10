export interface PaymentOptionData {
  id: string
  name: string
  icon: string
  redirectUrl: string | null
}

export const usePaymentOptionsStore = defineStore('paymentOptions', () => {
  const items = ref<PaymentOptionData[]>([])

  function apply(data: PaymentOptionData[]) {
    items.value = data
  }

  return { items, apply }
})
