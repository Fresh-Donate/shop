<script setup lang="ts">
interface FilterItem {
  id: string
  label: string
}

const props = defineProps<{
  servers: FilterItem[]
  categories: FilterItem[]
}>()

const selectedServer = defineModel<string>('server', { default: 'all' })
const selectedCategory = defineModel<string>('category', { default: 'all' })
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Servers -->
    <div class="rounded-xl border border-default bg-elevated p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon
          name="i-lucide-server"
          class="size-4 text-muted"
        />
        <span class="text-sm font-semibold">Сервера</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton
          label="Все"
          :variant="selectedServer === 'all' ? 'solid' : 'soft'"
          :color="selectedServer === 'all' ? 'primary' : 'neutral'"
          size="sm"
          @click="selectedServer = 'all'"
        />
        <UButton
          v-for="server in props.servers"
          :key="server.id"
          :label="server.label"
          :variant="selectedServer === server.id ? 'solid' : 'soft'"
          :color="selectedServer === server.id ? 'primary' : 'neutral'"
          size="sm"
          @click="selectedServer = server.id"
        />
      </div>
    </div>

    <!-- Categories -->
    <div class="rounded-xl border border-default bg-elevated p-4">
      <div class="flex items-center gap-2 mb-3">
        <UIcon
          name="i-lucide-grid-2x2"
          class="size-4 text-muted"
        />
        <span class="text-sm font-semibold">Категории</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton
          label="Все товары"
          :variant="selectedCategory === 'all' ? 'solid' : 'soft'"
          :color="selectedCategory === 'all' ? 'primary' : 'neutral'"
          size="sm"
          @click="selectedCategory = 'all'"
        />
        <UButton
          v-for="cat in props.categories"
          :key="cat.id"
          :label="cat.label"
          :variant="selectedCategory === cat.id ? 'solid' : 'soft'"
          :color="selectedCategory === cat.id ? 'primary' : 'neutral'"
          size="sm"
          @click="selectedCategory = cat.id"
        />
      </div>
    </div>
  </div>
</template>
