<script setup lang="ts">
import type { ProductPromotion } from '~/stores/products'

const props = defineProps<{
  id: string
  name: string
  price: number
  quantity: number
  currency?: string
  imageUrl?: string
  activePromotions?: ProductPromotion[]
  discountPercent?: number
  discountedPrice?: number
}>()

const emit = defineEmits<{
  addToCart: [id: string]
}>()

// True when the backend reported any active promotion AND it actually moves
// the price — guards against a 0% promotion or an empty array sneaking in.
const hasDiscount = computed(() =>
  (props.discountPercent ?? 0) > 0
  && props.discountedPrice !== undefined
  && props.discountedPrice < props.price
)

const finalPrice = computed(() =>
  hasDiscount.value ? (props.discountedPrice as number) : props.price
)

const currencySymbol = computed(() => props.currency || '₽')
</script>

<template>
  <div class="group rounded-xl border border-default bg-elevated overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
    <!-- Image -->
    <div class="relative aspect-square bg-muted/10 overflow-hidden">
      <img
        v-if="props.imageUrl"
        :src="props.imageUrl"
        :alt="props.name"
        loading="lazy"
        decoding="async"
        class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
      >
      <div
        v-else
        class="size-full flex items-center justify-center"
      >
        <UIcon
          name="i-lucide-package"
          class="size-16 text-muted/30"
        />
      </div>

      <!-- Promotion badges. Stacked top-left so the percent jumps out
           first; the human-readable name(s) follow underneath. -->
      <div
        v-if="hasDiscount"
        class="absolute top-2 left-2 flex flex-col items-start gap-1"
      >
        <span class="px-2 py-0.5 rounded-md text-xs font-bold bg-primary text-inverted shadow">
          −{{ props.discountPercent }}%
        </span>
        <span
          v-for="promo in props.activePromotions"
          :key="promo.id"
          class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-elevated/95 text-default border border-default backdrop-blur-sm"
        >
          {{ promo.name }}
        </span>
      </div>
    </div>

    <!-- Info -->
    <div class="p-4">
      <h3 class="font-bold truncate">
        {{ props.name }}
      </h3>
      <div class="flex items-center justify-between mt-2">
        <div class="flex items-baseline gap-1.5 min-w-0">
          <span class="text-lg font-bold text-primary tabular-nums">
            {{ finalPrice.toLocaleString() }}{{ currencySymbol }}
          </span>
          <span
            v-if="hasDiscount"
            class="text-xs text-muted line-through tabular-nums"
          >
            {{ props.price.toLocaleString() }}{{ currencySymbol }}
          </span>
          <span class="text-xs text-muted shrink-0">/ {{ props.quantity }} шт.</span>
        </div>
        <UButton
          icon="i-lucide-shopping-cart"
          size="sm"
          square
          @click="emit('addToCart', props.id)"
        />
      </div>
    </div>
  </div>
</template>
