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
      apiBase: 'http://localhost:3001',
      // Public origin of the shop (no trailing slash). Used to build absolute
      // URLs for canonical links, Open Graph, Twitter Card and the sitemap.
      // Override at runtime with `NUXT_PUBLIC_SITE_URL=https://shop.example.com`.
      siteUrl: 'http://localhost:3002'
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
