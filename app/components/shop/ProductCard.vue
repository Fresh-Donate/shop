<script setup lang="ts">
const props = defineProps<{
  id: string
  name: string
  price: number
  quantity: number
  currency?: string
  imageUrl?: string
}>()

const emit = defineEmits<{
  addToCart: [id: string]
}>()
</script>

<template>
  <div class="group rounded-xl border border-default bg-elevated overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
    <!-- Image -->
    <div class="aspect-square bg-muted/10 overflow-hidden">
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
    </div>

    <!-- Info -->
    <div class="p-4">
      <h3 class="font-bold truncate">
        {{ props.name }}
      </h3>
      <div class="flex items-center justify-between mt-2">
        <div class="flex items-baseline gap-1">
          <span class="text-lg font-bold text-primary">{{ props.price.toLocaleString() }}{{ props.currency || '₽' }}</span>
          <span class="text-xs text-muted">/ {{ props.quantity }} шт.</span>
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
