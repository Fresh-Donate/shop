<script setup lang="ts">
const cart = useCartStore()
const settings = useShopSettingsStore()

interface navLink {
  label: string
  to: string
  icon: string
}

const navLinks: navLink[] = []
</script>

<template>
  <div class="min-h-screen flex flex-col bg-default">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 border-b border-default bg-elevated/80 backdrop-blur-xl">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo + Name -->
          <NuxtLink
            to="/"
            class="flex items-center gap-2.5"
          >
            <div class="size-8 rounded-lg bg-primary flex items-center justify-center">
              <UIcon
                name="i-lucide-box"
                class="size-4 text-white"
              />
            </div>
            <span class="text-lg font-bold tracking-tight">{{ settings.name }}</span>
          </NuxtLink>

          <!-- Nav links (desktop) -->
          <nav class="hidden md:flex items-center gap-1">
            <UButton
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              :label="link.label"
              :icon="link.icon"
              variant="ghost"
              size="sm"
            />
          </nav>

          <!-- Right side -->
          <div class="flex items-center gap-2" />
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-default">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Footer top -->
        <div class="flex items-center justify-between py-6">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-lg bg-primary flex items-center justify-center">
              <UIcon
                name="i-lucide-box"
                class="size-5 text-white"
              />
            </div>
            <div>
              <p class="font-bold">
                {{ settings.name }}
              </p>
              <p
                v-if="settings.description"
                class="text-sm text-muted"
              >
                {{ settings.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer bottom -->
        <div class="border-t border-default py-4 text-center text-sm text-muted">
          <p>&copy; {{ new Date().getFullYear() }} {{ settings.name }}. Все права защищены.</p>
          <p class="mt-1">
            Сайт создан с помощью
            <NuxtLink
              to="https://github.com/Fresh-Donate"
              target="_blank"
              class="text-primary hover:underline"
            >
              FreshDonate
            </NuxtLink>
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
