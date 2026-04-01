<script setup lang="ts">
defineProps<{
  title: string
  serverIp?: string
}>()

const copied = ref(false)

function copyIp(ip: string) {
  navigator.clipboard.writeText(ip)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-default">
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px]" />
    </div>

    <div class="relative flex items-center justify-between px-8 py-12 md:py-16">
      <div class="space-y-4">
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight">
          {{ title }}
        </h1>

        <UButton
          v-if="serverIp"
          :label="copied ? 'Скопировано!' : serverIp"
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          variant="subtle"
          color="neutral"
          size="lg"
          @click="copyIp(serverIp!)"
        />
      </div>

      <!-- Decorative element -->
      <div class="hidden md:block">
        <div class="size-48 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <UIcon
            name="i-lucide-pickaxe"
            class="size-24 text-primary/40"
          />
        </div>
      </div>
    </div>
  </div>
</template>
