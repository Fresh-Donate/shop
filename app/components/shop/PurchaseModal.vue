<script setup lang="ts">
import type { Product } from '~/stores/products'

const props = defineProps<{
  product: Product
}>()

const open = defineModel<boolean>('open', { default: false })

const currencySymbols: Record<string, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€'
}

const symbol = computed(() => currencySymbols[props.product.currency] || props.product.currency)

const paymentOptionsStore = usePaymentOptionsStore()

const nickname = ref('')
const email = ref('')
const selectedMethod = ref('')
const termsAccepted = ref(false)

const paymentMethods = computed(() =>
  paymentOptionsStore.items.map(o => ({
    id: o.id,
    label: o.name,
    icon: o.icon
  }))
)

watch(paymentMethods, (methods) => {
  if (methods.length > 0 && !methods.find(m => m.id === selectedMethod.value)) {
    selectedMethod.value = methods[0].id
  }
}, { immediate: true })

const totalPrice = computed(() => {
  return props.product.price
})

const typeLabels: Record<string, string> = {
  item: 'Предмет',
  privilege: 'Привилегия',
  currency: 'Валюта',
  other: 'Товар'
}

const quantitySuffix: Record<string, string> = {
  item: 'шт.',
  privilege: 'дн.',
  currency: 'монет',
  other: 'шт.'
}

const config = useRuntimeConfig()
const purchasing = ref(false)
const purchaseResult = ref<{ status: string, id: string } | null>(null)
const purchaseError = ref('')

async function purchase() {
  purchasing.value = true
  purchaseError.value = ''
  purchaseResult.value = null

  try {
    const result = await $fetch<{ id: string, status: string, externalPaymentUrl: string | null }>('/payments', {
      baseURL: config.public.apiBase as string,
      method: 'POST',
      body: {
        productId: props.product.id,
        nickname: nickname.value,
        email: email.value,
        paymentOptionId: selectedMethod.value
      }
    })

    if (result.status === 'delivered') {
      // Demo mode — instant success
      purchaseResult.value = { status: 'delivered', id: result.id }
    } else if (result.externalPaymentUrl) {
      // Redirect to payment page
      window.location.href = result.externalPaymentUrl
    } else {
      // Pending, no URL yet (provider not implemented)
      purchaseResult.value = { status: 'pending', id: result.id }
    }
  } catch (err: any) {
    purchaseError.value = err?.data?.message || err?.data?.error || 'Произошла ошибка при создании платежа'
  } finally {
    purchasing.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{
      content: 'sm:max-w-3xl'
    }"
  >
    <template #content>
      <div class="flex flex-col sm:flex-row">
        <!-- Left: Product Info -->
        <div class="sm:w-72 shrink-0 p-6 border-b sm:border-b-0 sm:border-r border-default bg-elevated/50">
          <!-- Image -->
          <div class="aspect-square rounded-xl overflow-hidden bg-muted/10 mb-4">
            <NuxtImg
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="product.name"
              class="size-full object-cover"
            />
            <div
              v-else
              class="size-full flex items-center justify-center"
            >
              <UIcon
                name="i-lucide-package"
                class="size-20 text-muted/20"
              />
            </div>
          </div>

          <!-- Product details -->
          <h3 class="text-lg font-bold">
            {{ product.name }}
          </h3>

          <div class="flex items-baseline gap-1.5 mt-1">
            <span class="text-xl font-bold text-primary">{{ product.price.toLocaleString() }}{{ symbol }}</span>
            <span class="text-sm text-muted">/ {{ product.quantity }} {{ quantitySuffix[product.type] || 'шт.' }}</span>
          </div>

          <div class="flex items-center gap-1.5 mt-2 text-sm text-muted">
            <UIcon
              name="i-lucide-tag"
              class="size-3.5"
            />
            <span>{{ typeLabels[product.type] || 'Товар' }} {{ product.name }}</span>
          </div>

          <p
            v-if="product.description"
            class="text-sm text-muted mt-3 leading-relaxed"
          >
            {{ product.description }}
          </p>
        </div>

        <!-- Right: Purchase Form -->
        <div class="flex-1 p-6 min-w-0">
          <!-- Header -->
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-xl font-bold">
              Оплата покупки
            </h2>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              size="sm"
              square
              @click="open = false"
            />
          </div>

          <!-- Total -->
          <div class="flex items-center justify-between mb-4">
            <span class="font-semibold">Итого:</span>
            <span class="text-xl font-bold text-primary">{{ totalPrice.toLocaleString() }}{{ symbol }}</span>
          </div>

          <!-- Warning -->
          <div class="flex gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20 mb-5">
            <UIcon
              name="i-lucide-triangle-alert"
              class="size-5 text-warning shrink-0 mt-0.5"
            />
            <div>
              <p class="text-sm font-medium text-warning">
                Предупреждение
              </p>
              <p class="text-xs text-muted mt-0.5">
                Некоторые товары (например блоки) могут быть выданы только если вы находитесь на сервере.
              </p>
            </div>
          </div>

          <!-- Form -->
          <p class="text-sm font-medium mb-3">
            Для покупки товара заполните форму ниже:
          </p>

          <div class="space-y-3">
            <UInput
              v-model="nickname"
              placeholder="Введите никнейм"
              icon="i-lucide-user"
              size="lg"
              class="w-full"
            />

            <UInput
              v-model="email"
              type="email"
              placeholder="Введите почту"
              icon="i-lucide-mail"
              size="lg"
              class="w-full"
            />
          </div>

          <!-- Payment methods -->
          <p class="text-sm font-medium mt-5 mb-3">
            Выберите способ оплаты:
          </p>

          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="method in paymentMethods"
              :key="method.id"
              type="button"
              class="flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium transition-all cursor-pointer text-left"
              :class="selectedMethod === method.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-default bg-elevated hover:border-muted'"
              @click="selectedMethod = method.id"
            >
              <UIcon
                :name="method.icon"
                class="size-4 shrink-0"
              />
              <span>{{ method.label }}</span>
            </button>
          </div>

          <!-- Terms -->
          <label class="flex items-start gap-2.5 mt-5 cursor-pointer">
            <UCheckbox v-model="termsAccepted" />
            <span class="text-xs text-muted leading-relaxed">
              Я принимаю условия
              <NuxtLink
                to="/terms"
                class="text-primary hover:underline"
              >пользовательского соглашения</NuxtLink>,
              <NuxtLink
                to="/agency"
                class="text-primary hover:underline"
              >агентский договор</NuxtLink>, и
              <NuxtLink
                to="/donation"
                class="text-primary hover:underline"
              >договор пожертвования</NuxtLink>
            </span>
          </label>

          <!-- Error -->
          <div
            v-if="purchaseError"
            class="flex gap-3 p-3 rounded-lg bg-error/10 border border-error/20 mt-4"
          >
            <UIcon
              name="i-lucide-alert-circle"
              class="size-5 text-error shrink-0 mt-0.5"
            />
            <p class="text-sm text-error">
              {{ purchaseError }}
            </p>
          </div>

          <!-- Success (demo) -->
          <div
            v-if="purchaseResult?.status === 'delivered'"
            class="flex gap-3 p-3 rounded-lg bg-success/10 border border-success/20 mt-4"
          >
            <UIcon
              name="i-lucide-check-circle"
              class="size-5 text-success shrink-0 mt-0.5"
            />
            <div>
              <p class="text-sm font-medium text-success">
                Покупка успешна!
              </p>
              <p class="text-xs text-muted mt-0.5">
                Товар будет выдан в ближайшее время.
              </p>
            </div>
          </div>

          <!-- Purchase button -->
          <UButton
            v-if="!purchaseResult"
            label="Приобрести"
            icon="i-lucide-shopping-cart"
            size="lg"
            class="w-full mt-5"
            :disabled="!nickname || !email || !termsAccepted"
            :loading="purchasing"
            @click="purchase"
          />
          <UButton
            v-else
            label="Закрыть"
            variant="soft"
            size="lg"
            class="w-full mt-5"
            @click="open = false"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
