<script setup lang="ts">
import { z } from 'zod'
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

// Mirrors the JSON Schema enforced by the backend at POST /payments
// (see fresh-donate-backend/src/routes/payments/index.ts). Keep in sync.
// Nickname rules follow Minecraft Java Edition: 3..16 chars of [a-zA-Z0-9_].
const baseShape = {
  nickname: z.string()
    .min(3, 'Минимум 3 символа')
    .max(16, 'Максимум 16 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Только латиница, цифры и нижнее подчёркивание'),
  email: z.string().min(1, 'Введите почту').email('Некорректный email').max(256, 'Максимум 256 символов'),
  paymentOptionId: z.string().min(1, 'Выберите способ оплаты'),
  termsAccepted: z.boolean().refine(v => v === true, { message: 'Нужно принять условия' })
}

const schema = computed(() => {
  if (props.product.allowCustomCount) {
    return z.object({
      ...baseShape,
      count: z.number({ message: 'Введите количество' })
        .int('Должно быть целое число')
        .min(1, 'Минимум 1')
        .max(100000, 'Максимум 100 000')
    })
  }
  return z.object(baseShape)
})

interface FormState {
  nickname: string
  email: string
  paymentOptionId: string
  count: number
  termsAccepted: boolean
}

const state = reactive<FormState>({
  nickname: '',
  email: '',
  paymentOptionId: '',
  count: 1,
  termsAccepted: false
})

const paymentMethods = computed(() =>
  paymentOptionsStore.items.map(o => ({
    id: o.id,
    label: o.name,
    icon: o.icon
  }))
)

watch(paymentMethods, (methods) => {
  if (methods.length > 0 && !methods.find(m => m.id === state.paymentOptionId)) {
    state.paymentOptionId = methods[0]!.id
  }
}, { immediate: true })

// Discount-aware unit price: prefer the backend's `discountedPrice` (which
// already accounts for stacked promo %), fall back to raw `price` when no
// promotion is active. The shop and the backend use the same helper, so
// what we display here matches what `PaymentService.create` will charge.
const hasDiscount = computed(() =>
  (props.product.discountPercent ?? 0) > 0
  && props.product.discountedPrice !== undefined
  && props.product.discountedPrice < props.product.price
)
const unitPrice = computed(() =>
  hasDiscount.value ? (props.product.discountedPrice as number) : props.product.price
)
const unitOriginalPrice = computed(() => props.product.price)

// Total reflects the count for custom-count products — for fixed-count
// items count is always 1, so the total equals the unit price.
const effectiveCount = computed(() =>
  props.product.allowCustomCount ? Math.max(1, Number(state.count) || 1) : 1
)
const totalPrice = computed(() =>
  Math.round(unitPrice.value * effectiveCount.value * 100) / 100
)
const totalOriginalPrice = computed(() =>
  Math.round(unitOriginalPrice.value * effectiveCount.value * 100) / 100
)

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

async function onSubmit() {
  purchasing.value = true
  purchaseError.value = ''
  purchaseResult.value = null

  try {
    const result = await $fetch<{ id: string, status: string, externalPaymentUrl: string | null }>('/payments', {
      baseURL: config.public.apiBase as string,
      method: 'POST',
      body: {
        productId: props.product.id,
        nickname: state.nickname,
        email: state.email,
        count: props.product.allowCustomCount ? state.count : undefined,
        paymentOptionId: state.paymentOptionId
      }
    })

    if (result.status === 'delivered') {
      purchaseResult.value = { status: 'delivered', id: result.id }
    } else if (result.externalPaymentUrl) {
      window.location.href = result.externalPaymentUrl
    } else {
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
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :alt="product.name"
              loading="lazy"
              decoding="async"
              class="size-full object-cover"
            >
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

          <!-- Promo badges (when active). Same names the shop card shows,
               so the buyer sees which campaigns are stacking. -->
          <div
            v-if="hasDiscount"
            class="flex flex-wrap gap-1.5 mt-2"
          >
            <span class="px-2 py-0.5 rounded-md text-xs font-bold bg-primary text-inverted">
              −{{ product.discountPercent }}%
            </span>
            <span
              v-for="promo in product.activePromotions"
              :key="promo.id"
              class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-elevated text-default border border-default"
            >
              {{ promo.name }}
            </span>
          </div>

          <div class="flex items-baseline gap-1.5 mt-2">
            <span class="text-xl font-bold text-primary tabular-nums">
              {{ unitPrice.toLocaleString() }}{{ symbol }}
            </span>
            <span
              v-if="hasDiscount"
              class="text-sm text-muted line-through tabular-nums"
            >
              {{ unitOriginalPrice.toLocaleString() }}{{ symbol }}
            </span>
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
            <div class="flex items-baseline gap-2">
              <span
                v-if="hasDiscount"
                class="text-sm text-muted line-through tabular-nums"
              >
                {{ totalOriginalPrice.toLocaleString() }}{{ symbol }}
              </span>
              <span class="text-xl font-bold text-primary tabular-nums">
                {{ totalPrice.toLocaleString() }}{{ symbol }}
              </span>
            </div>
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

          <UForm
            :schema="schema"
            :state="state"
            class="space-y-3"
            @submit="onSubmit"
          >
            <UFormField name="nickname">
              <UInput
                v-model="state.nickname"
                placeholder="Введите никнейм"
                icon="i-lucide-user"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UFormField name="email">
              <UInput
                v-model="state.email"
                type="email"
                placeholder="Введите почту"
                icon="i-lucide-mail"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UFormField
              v-if="product.allowCustomCount"
              name="count"
            >
              <UInput
                v-model.number="state.count"
                type="number"
                placeholder="Введите количество"
                icon="i-lucide-bolt"
                size="lg"
                :min="1"
                :max="100000"
                class="w-full"
              />
            </UFormField>

            <!-- Payment methods -->
            <UFormField
              name="paymentOptionId"
              class="!mt-5"
            >
              <p
                v-if="paymentMethods.length > 1"
                class="text-sm font-medium mb-3"
              >
                Выберите способ оплаты:
              </p>

              <div
                v-if="paymentMethods.length > 1"
                class="grid grid-cols-2 gap-2"
              >
                <button
                  v-for="method in paymentMethods"
                  :key="method.id"
                  type="button"
                  class="flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium transition-all cursor-pointer text-left"
                  :class="state.paymentOptionId === method.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-default bg-elevated hover:border-muted'"
                  @click="state.paymentOptionId = method.id"
                >
                  <UIcon
                    :name="method.icon"
                    class="size-4 shrink-0"
                  />
                  <span>{{ method.label }}</span>
                </button>
              </div>
            </UFormField>

            <!-- Terms -->
            <UFormField
              name="termsAccepted"
              class="!mt-5"
            >
              <label class="flex items-start gap-2.5 cursor-pointer">
                <UCheckbox v-model="state.termsAccepted" />
                <span class="text-xs text-muted leading-relaxed">
                  Я принимаю условия
                  <NuxtLink
                    to="/legal/terms"
                    class="text-primary hover:underline"
                  >пользовательского соглашения</NuxtLink>,
                  <NuxtLink
                    to="/legal/offer"
                    class="text-primary hover:underline"
                  >публичной оферты</NuxtLink>, и
                  <NuxtLink
                    to="/legal/privacy"
                    class="text-primary hover:underline"
                  >политики конфиденциальности</NuxtLink>
                </span>
              </label>
            </UFormField>

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
              type="submit"
              label="Приобрести"
              icon="i-lucide-shopping-cart"
              size="lg"
              class="w-full !mt-5"
              :loading="purchasing"
            />
            <UButton
              v-else
              type="button"
              label="Закрыть"
              variant="soft"
              size="lg"
              class="w-full !mt-5"
              @click="open = false"
            />
          </UForm>
        </div>
      </div>
    </template>
  </UModal>
</template>
