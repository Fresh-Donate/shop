// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/icon',
    '@pinia/nuxt'
  ],
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001'
      // Note: the shop's public origin (used for canonical/OG/sitemap) lives
      // in the database — see `shopUrl` on shop settings, edited from the
      // admin panel. No env var, single source of truth.
    }
  },

  routeRules: {
    '/api/version': {
      cors: true,
      headers: { 'Access-Control-Allow-Origin': '*' }
    }
  },

  devServer: {
    port: 3002
  },
  compatibilityDate: '2025-07-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    mode: 'css',
    cssLayer: 'base',
    componentName: 'Icon'
  }
})
