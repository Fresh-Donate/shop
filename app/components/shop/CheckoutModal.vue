<script setup lang="ts">
import { z } from 'zod'

const open = defineModel<boolean>('open', { default: false })

const cart = useCartStore()
const paymentOptionsStore = usePaymentOptionsStore()
const { display: displayPrice, displayCurrency, format } = useCurrency()

const cartCurrency = computed(() => cart.cartCurrency || 'RUB')
const showNative = computed(() => displayCurrency.value !== cartCurrency.value)

function formatNative(amount: number): string {
  return format(amount, cartCurrency.value as 'RUB' | 'USD' | 'EUR')
}

const schema = z.object({
  nickname: z.string()
    .min(3, 'Минимум 3 символа')
    .max(16, 'Максимум 16 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Только латиница, цифры и нижнее подчёркивание'),
  email: z.string().min(1, 'Введите почту').email('Некорректный email').max(256, 'Максимум 256 символов'),
  paymentOptionId: z.string().min(1, 'Выберите способ оплаты'),
  termsAccepted: z.boolean().refine(v => v === true, { message: 'Нужно принять условия' })
})

interface FormState {
  nickname: string
  email: string
  paymentOptionId: string
  termsAccepted: boolean
}

const profile = useBuyerProfile()

const state = reactive<FormState>({
  nickname: profile.value.nickname,
  email: profile.value.email,
  paymentOptionId: profile.value.paymentOptionId,
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
  paymentOptionsStore.items.map(o => ({ id: o.id, label: o.name, icon: o.icon }))
)
const selectedOption = computed(() =>
  paymentOptionsStore.items.find(o => o.id === state.paymentOptionId)
)

watch(paymentMethods, (methods) => {
  if (methods.length > 0 && !methods.find(m => m.id === state.paymentOptionId)) {
    state.paymentOptionId = methods[0]!.id
  }
}, { immediate: true })

// Only price the basket while the checkout is actually open - the modal lives
// in the layout permanently, so an ungated preview would fire on every
// add-to-cart even when the user never opens checkout.
const { preview, loading: previewLoading } = useCartPreview(
  () => (open.value ? cart.apiItems : []),
  () => state.nickname
)

function previewItem(productId: string) {
  return preview.value?.items.find(i => i.productId === productId)
}

const total = computed(() => {
  if (preview.value) return preview.value.total
  return cart.subtotal
})

const blockedCount = computed(() => preview.value?.blockedCount ?? 0)
const currencyMismatch = computed(() => preview.value?.currencyMismatch ?? false)

const quantitySuffix: Record<string, string> = {
  item: 'шт.',
  privilege: 'дн.',
  currency: 'монет',
  other: 'шт.'
}

const $api = useNuxtApp().$api as typeof $fetch
const purchasing = ref(false)
const purchaseResult = ref<{ status: string, id: string, itemsCount: number } | null>(null)
const purchaseError = ref('')

const canSubmit = computed(() =>
  !cart.isEmpty && blockedCount.value === 0 && !currencyMismatch.value
)

watch(() => cart.isEmpty, (empty) => {
  if (empty && open.value && !purchaseResult.value) open.value = false
})

function renderRedirectUrl(template: string): string {
  const values: Record<string, string | number> = {
    nickname: state.nickname,
    email: state.email,
    amount: total.value,
    currency: cartCurrency.value,
    product: `Заказ из ${cart.distinctCount} товаров`,
    count: cart.distinctCount
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

    const result = await $api<{ id: string, status: string, externalPaymentUrl: string | null, itemsCount: number }>('/payments/cart', {
      method: 'POST',
      body: {
        items: cart.apiItems,
        nickname: state.nickname,
        email: state.email,
        paymentOptionId: state.paymentOptionId
      }
    })

    if (result.status === 'delivered') {
      purchaseResult.value = { status: 'delivered', id: result.id, itemsCount: result.itemsCount }
      cart.clear()
    } else if (result.externalPaymentUrl) {
      cart.clear()
      window.location.href = result.externalPaymentUrl
    } else {
      purchaseResult.value = { status: 'pending', id: result.id, itemsCount: result.itemsCount }
      cart.clear()
    }
  } catch (err: any) {
    purchaseError.value = err?.data?.message || err?.data?.error || 'Не удалось создать платёж'
  } finally {
    purchasing.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #content>
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xl font-bold">
            Оформление заказа
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

        <!-- Success -->
        <div
          v-if="purchaseResult"
          class="text-center py-8"
        >
          <UIcon
            :name="purchaseResult.status === 'delivered' ? 'i-lucide-check-circle' : 'i-lucide-clock'"
            :class="purchaseResult.status === 'delivered' ? 'text-success' : 'text-info'"
            class="size-16 mx-auto"
          />
          <h3 class="text-lg font-bold mt-4">
            {{ purchaseResult.status === 'delivered' ? 'Покупка успешна!' : 'Заказ создан' }}
          </h3>
          <p class="text-sm text-muted mt-1">
            Заказ из {{ purchaseResult.itemsCount }} {{ purchaseResult.itemsCount === 1 ? 'товара' : 'товаров' }} оформлен.
          </p>
          <UButton
            label="Закрыть"
            variant="soft"
            class="mt-6"
            @click="open = false"
          />
        </div>

        <template v-else>
          <!-- Items -->
          <div class="space-y-2 mb-4 max-h-64 overflow-y-auto">
            <div
              v-for="item in cart.items"
              :key="item.productId"
              class="flex items-center gap-3 p-2.5 rounded-lg border"
              :class="previewItem(item.productId)?.blocked || previewItem(item.productId)?.groupConflict
                ? 'border-error/40 bg-error/5'
                : 'border-default bg-elevated/50'"
            >
              <div class="size-10 rounded-md overflow-hidden bg-muted/10 shrink-0">
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.name"
                  class="size-full object-cover"
                >
                <div
                  v-else
                  class="size-full flex items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-package"
                    class="size-5 text-muted/30"
                  />
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium truncate">
                  {{ item.name }}
                </p>
                <p
                  v-if="previewItem(item.productId)?.blocked"
                  class="text-xs text-error"
                >
                  Уже куплен на этом нике
                </p>
                <p
                  v-else-if="previewItem(item.productId)?.groupConflict"
                  class="text-xs text-error"
                >
                  Конфликт апгрейд-группы - оставьте один товар
                </p>
                <p
                  v-else
                  class="text-xs text-muted tabular-nums"
                >
                  {{ displayPrice(previewItem(item.productId)?.unitPrice ?? item.price, item.currency) }}
                  / {{ quantitySuffix[item.type] || 'шт.' }}
                </p>
              </div>

              <!-- Count -->
              <div
                v-if="item.allowCustomCount && item.type !== 'privilege'"
                class="flex items-center gap-1 shrink-0"
              >
                <UButton
                  icon="i-lucide-minus"
                  size="xs"
                  variant="soft"
                  color="neutral"
                  square
                  :disabled="item.count <= 1"
                  @click="cart.setCount(item.productId, item.count - 1)"
                />
                <span class="w-8 text-center text-sm tabular-nums">{{ item.count }}</span>
                <UButton
                  icon="i-lucide-plus"
                  size="xs"
                  variant="soft"
                  color="neutral"
                  square
                  @click="cart.setCount(item.productId, item.count + 1)"
                />
              </div>

              <span class="text-sm font-semibold tabular-nums shrink-0 w-20 text-right">
                {{ displayPrice(previewItem(item.productId)?.lineTotal ?? (item.price * item.count), item.currency) }}
              </span>

              <UButton
                icon="i-lucide-trash-2"
                size="xs"
                variant="ghost"
                color="error"
                square
                @click="cart.removeItem(item.productId)"
              />
            </div>
          </div>

          <!-- Blocked warning -->
          <div
            v-if="blockedCount > 0"
            class="flex gap-3 p-3 rounded-lg bg-error/10 border border-error/20 mb-4"
          >
            <UIcon
              name="i-lucide-shield-alert"
              class="size-5 text-error shrink-0 mt-0.5"
            />
            <p class="text-sm text-error">
              Уберите выделенные товары из корзины, чтобы продолжить.
            </p>
          </div>

          <!-- Total -->
          <div class="flex items-center justify-between py-3 border-t border-default mb-4">
            <span class="font-semibold">Итого:</span>
            <div class="flex flex-col items-end">
              <span class="text-xl font-bold text-primary tabular-nums">
                <UIcon
                  v-if="previewLoading"
                  name="i-lucide-loader-circle"
                  class="size-4 animate-spin inline-block mr-1"
                />
                {{ displayPrice(total, cartCurrency) }}
              </span>
              <span
                v-if="showNative"
                class="text-xs text-muted tabular-nums mt-0.5"
              >
                ≈ {{ formatNative(total) }} к оплате
              </span>
            </div>
          </div>

          <!-- Form -->
          <UForm
            :schema="schema"
            :state="state"
            class="space-y-3"
            @submit="onSubmit"
          >
            <UFormField name="nickname">
              <UInput
                v-model="state.nickname"
                placeholder="Никнейм"
                icon="i-lucide-user"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UFormField name="email">
              <UInput
                v-model="state.email"
                type="email"
                placeholder="Email"
                icon="i-lucide-mail"
                size="lg"
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

            <UButton
              type="submit"
              :label="`Оплатить ${displayPrice(total, cartCurrency)}`"
              icon="i-lucide-shopping-cart"
              size="lg"
              class="w-full !mt-5"
              :loading="purchasing"
              :disabled="!canSubmit"
            />
          </UForm>
        </template>
      </div>
    </template>
  </UModal>
</template>
