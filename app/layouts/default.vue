<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
    <!-- Header -->
    <header class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <NuxtLink
            to="/"
            class="text-xl font-bold text-primary"
          >
            FreshDonate
          </NuxtLink>

          <nav class="flex items-center gap-4">
            <UButton
              to="/"
              variant="ghost"
              label="Магазин"
              icon="i-lucide-store"
            />
            <UButton
              to="/cart"
              variant="ghost"
              icon="i-lucide-shopping-cart"
            />
          </nav>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-500">
      <p>Powered by FreshDonate</p>
    </footer>
  </div>
</template>
