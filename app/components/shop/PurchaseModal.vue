<script setup lang="ts">
import { z } from 'zod'
import type { Product } from '~/stores/products'

const props = defineProps<{
  product: Product
}>()

const open = defineModel<boolean>('open', { default: false })

const { display: displayPrice, displayCurrency, format } = useCurrency()

const showNative = computed(() => displayCurrency.value !== props.product.currency)

function formatNative(amount: number): string {
  return format(amount, props.product.currency as 'RUB' | 'USD' | 'EUR')
}

const paymentOptionsStore = usePaymentOptionsStore()

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

const profile = useBuyerProfile()

const state = reactive<FormState>({
  nickname: profile.value.nickname,
  email: profile.value.email,
  paymentOptionId: profile.value.paymentOptionId,
  count: 1,
  termsAccepted: false
})

watch(open, (isOpen) => {
  if (!isOpen) return
  if (profile.value.nickname) state.nickname = profile.value.nickname
  if (profile.value.email) state.email = profile.value.email
  if (profile.value.paymentOptionId) state.paymentOptionId = profile.value.paymentOptionId
})

watch(
  () => [state.nickname, state.email, state.paymentOptionId] as const,
  ([nickname, email, paymentOptionId]) => {
    profile.value = { nickname, email, paymentOptionId }
  }
)

const paymentMethods = computed(() =>
  paymentOptionsStore.items.map(o => ({
    id: o.id,
    label: o.name,
    icon: o.icon
  }))
)

const selectedOption = computed(() =>
  paymentOptionsStore.items.find(o => o.id === state.paymentOptionId)
)

watch(paymentMethods, (methods) => {
  if (methods.length > 0 && !methods.find(m => m.id === state.paymentOptionId)) {
    state.paymentOptionId = methods[0]!.id
  }
}, { immediate: true })

const isPrivilege = computed(() => props.product.type === 'privilege')

const { preview, loading: previewLoading, error: previewError } = useUpgradePreview(
  () => props.product.id,
  () => state.nickname
)

const promoDiscount = computed(() =>
  (props.product.discountPercent ?? 0) > 0
  && props.product.discountedPrice !== undefined
  && props.product.discountedPrice < props.product.price
)

const unitPrice = computed(() => {
  if (preview.value && !preview.value.blocked) return preview.value.finalUnitPrice
  if (promoDiscount.value) return props.product.discountedPrice as number
  return props.product.price
})
const unitOriginalPrice = computed(() => props.product.price)

const effectiveCount = computed(() =>
  isPrivilege.value
    ? 1
    : props.product.allowCustomCount
      ? Math.max(1, Number(state.count) || 1)
      : 1
)
const totalPrice = computed(() =>
  Math.round(unitPrice.value * effectiveCount.value * 100) / 100
)
const totalOriginalPrice = computed(() =>
  Math.round(unitOriginalPrice.value * effectiveCount.value * 100) / 100
)

const hasDiscount = computed(() => unitPrice.value < unitOriginalPrice.value)

const upgradeBlocked = computed(() => preview.value?.blocked === true)
const upgradeDiscount = computed(() => preview.value?.upgradeDiscount ?? 0)
const hasUpgradeDiscount = computed(() => upgradeDiscount.value > 0 && !upgradeBlocked.value)

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

const $api = useNuxtApp().$api as typeof $fetch
const purchasing = ref(false)
const purchaseResult = ref<{ status: string, id: string } | null>(null)
const purchaseError = ref('')

function renderRedirectUrl(template: string): string {
  const values: Record<string, string | number> = {
    nickname: state.nickname,
    email: state.email,
    amount: totalPrice.value,
    price: unitPrice.value,
    currency: props.product.currency,
    product: props.product.name,
    productId: props.product.id,
    count: effectiveCount.value
  }
  return template.replace(/\{(\w+)}/g, (match, key: string) => {
    const value = values[key]
    return value === undefined ? match : encodeURIComponent(String(value))
  })
}

async function onSubmit() {
  purchasing.value = true
  purchaseError.value = ''
  purchaseResult.value = null

  try {
    const option = selectedOption.value
    if (option?.redirectUrl) {
      window.location.href = renderRedirectUrl(option.redirectUrl)
      return
    }

    const result = await $api<{ id: string, status: string, externalPaymentUrl: string | null }>('/payments', {
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
    scrollable
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

          <!-- Promo badges -->
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
              {{ displayPrice(unitPrice, product.currency) }}
            </span>
            <span
              v-if="hasDiscount"
              class="text-sm text-muted line-through tabular-nums"
            >
              {{ displayPrice(unitOriginalPrice, product.currency) }}
            </span>
            <span class="text-sm text-muted">/ {{ product.quantity }} {{ quantitySuffix[product.type] || 'шт.' }}</span>
          </div>
          <p
            v-if="showNative"
            class="text-xs text-muted mt-1.5"
          >
            Оплата спишется в {{ product.currency }} ({{ formatNative(unitPrice) }})
          </p>

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

          <div
            v-if="product.servers && product.servers.length > 0"
            class="mt-3"
          >
            <p class="text-xs font-medium text-muted mb-1.5">
              Сервера выдачи
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="srv in product.servers"
                :key="srv.id"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-elevated text-default border border-default"
              >
                <UIcon
                  name="i-lucide-server"
                  class="size-3.5 text-primary"
                />
                {{ srv.name }}
              </span>
            </div>
            <p
              v-if="product.servers.length > 1"
              class="text-[11px] text-muted mt-1.5"
            >
              Товар будет выдан на каждом из перечисленных серверов.
            </p>
          </div>
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
            <div class="flex flex-col items-end">
              <div class="flex items-baseline gap-2">
                <span
                  v-if="hasDiscount"
                  class="text-sm text-muted line-through tabular-nums"
                >
                  {{ displayPrice(totalOriginalPrice, product.currency) }}
                </span>
                <span class="text-xl font-bold text-primary tabular-nums">
                  {{ displayPrice(totalPrice, product.currency) }}
                </span>
              </div>
              <span
                v-if="showNative"
                class="text-xs text-muted tabular-nums mt-0.5"
              >
                ≈ {{ formatNative(totalPrice) }} к оплате
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
              v-if="product.allowCustomCount && !isPrivilege"
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

            <!-- Upgrade-mode preview readout -->
            <div
              v-if="upgradeBlocked"
              class="flex gap-3 p-3 rounded-lg bg-error/10 border border-error/20 mt-1"
            >
              <UIcon
                name="i-lucide-shield-alert"
                class="size-5 text-error shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-error">
                  Покупка заблокирована
                </p>
                <p class="text-xs text-muted mt-0.5">
                  <template v-if="preview?.reference">
                    На никнейме "{{ state.nickname }}" уже есть "{{ preview.reference.productName }}" из этой группы - выберите более дорогой товар.
                  </template>
                  <template v-else>
                    На этом нике уже куплен товар из этой группы.
                  </template>
                </p>
              </div>
            </div>

            <div
              v-else-if="hasUpgradeDiscount"
              class="flex gap-3 p-3 rounded-lg bg-success/10 border border-success/20 mt-1"
            >
              <UIcon
                name="i-lucide-arrow-up-right"
                class="size-5 text-success shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-success">
                  Доплата −{{ displayPrice(upgradeDiscount, product.currency) }}
                </p>
                <p class="text-xs text-muted mt-0.5">
                  <template v-if="preview?.reference">
                    Учтена стоимость "{{ preview.reference.productName }}" - вы уже владеете этой позицией.
                  </template>
                </p>
              </div>
            </div>

            <p
              v-else-if="previewLoading && state.nickname.length >= 3"
              class="text-xs text-muted mt-1"
            >
              <UIcon
                name="i-lucide-loader-circle"
                class="size-3.5 animate-spin inline-block mr-1"
              />
              Проверяем цену...
            </p>
            <!-- previewError -->
            <span
              v-if="previewError"
              class="hidden"
            >{{ previewError }}</span>

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
              :disabled="upgradeBlocked"
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
