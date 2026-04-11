<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()

const paymentId = computed(() => route.query.paymentId as string)

const currencySymbols: Record<string, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€'
}

interface PaymentStatus {
  id: string
  status: string
  productName: string
  totalAmount: number
  currency: string
}

const payment = ref<PaymentStatus | null>(null)
const loading = ref(true)
const error = ref(false)

const statusConfig: Record<string, { icon: string; color: string; title: string; description: string }> = {
  delivered: {
    icon: 'i-lucide-check-circle',
    color: 'text-success',
    title: 'Покупка успешна!',
    description: 'Товар был выдан. Проверьте свой инвентарь на сервере.'
  },
  paid: {
    icon: 'i-lucide-clock',
    color: 'text-info',
    title: 'Оплата подтверждена',
    description: 'Платёж получен, товар скоро будет выдан.'
  },
  pending: {
    icon: 'i-lucide-loader-circle',
    color: 'text-warning',
    title: 'Ожидание оплаты',
    description: 'Платёж обрабатывается платёжной системой. Подождите немного...'
  },
  failed: {
    icon: 'i-lucide-x-circle',
    color: 'text-error',
    title: 'Платёж не прошёл',
    description: 'Произошла ошибка при оплате. Попробуйте снова.'
  }
}

let pollInterval: ReturnType<typeof setInterval> | null = null

async function checkStatus() {
  if (!paymentId.value) {
    error.value = true
    loading.value = false
    return
  }

  try {
    const data = await $fetch<PaymentStatus>(`/payments/${paymentId.value}/status`, {
      baseURL: config.public.apiBase as string
    })
    payment.value = data

    // Stop polling once payment is no longer pending
    if (data.status !== 'pending' && pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkStatus()
  // Poll every 3 seconds while pending
  pollInterval = setInterval(checkStatus, 3000)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})

const currentStatus = computed(() => {
  if (!payment.value) return null
  return statusConfig[payment.value.status] || statusConfig.pending
})

const symbol = computed(() => {
  if (!payment.value) return ''
  return currencySymbols[payment.value.currency] || payment.value.currency
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Loading -->
      <div
        v-if="loading"
        class="text-center py-12"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-12 animate-spin text-muted mx-auto"
        />
        <p class="text-muted mt-4">
          Проверяем статус платежа...
        </p>
      </div>

      <!-- Error -->
      <div
        v-else-if="error || !payment"
        class="text-center py-12"
      >
        <UIcon
          name="i-lucide-alert-circle"
          class="size-16 text-error mx-auto"
        />
        <h2 class="text-xl font-bold mt-4">
          Платёж не найден
        </h2>
        <p class="text-muted mt-2">
          Не удалось найти информацию о платеже.
        </p>
        <UButton
          to="/"
          label="Вернуться в магазин"
          variant="soft"
          class="mt-6"
          icon="i-lucide-arrow-left"
        />
      </div>

      <!-- Payment status -->
      <div
        v-else
        class="text-center"
      >
        <UIcon
          :name="currentStatus!.icon"
          :class="[currentStatus!.color, payment.status === 'pending' ? 'animate-spin' : '']"
          class="size-20 mx-auto"
        />

        <h2 class="text-2xl font-bold mt-6">
          {{ currentStatus!.title }}
        </h2>

        <p class="text-muted mt-2">
          {{ currentStatus!.description }}
        </p>

        <!-- Payment details -->
        <div class="mt-6 rounded-xl border border-default bg-elevated/50 p-5 text-left space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-muted">Товар</span>
            <span class="text-sm font-medium">{{ payment.productName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted">Сумма</span>
            <span class="text-sm font-bold">{{ Number(payment.totalAmount).toLocaleString() }}{{ symbol }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-muted">Статус</span>
            <UBadge
              :label="currentStatus!.title"
              :color="payment.status === 'delivered' || payment.status === 'paid' ? 'success' : payment.status === 'failed' ? 'error' : 'warning'"
              variant="subtle"
              size="sm"
            />
          </div>
        </div>

        <UButton
          to="/"
          :label="payment.status === 'pending' ? 'Вернуться в магазин' : 'Продолжить покупки'"
          :variant="payment.status === 'pending' ? 'ghost' : 'soft'"
          class="mt-6"
          :icon="payment.status === 'pending' ? 'i-lucide-arrow-left' : 'i-lucide-shopping-bag'"
        />
      </div>
    </div>
  </div>
</template>
