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

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001',
      appVersion: process.env.npm_package_version || '0.0.0'
    }
  },

  routeRules: {
    '/api/version': {
      cors: true,
      headers: { 'Access-Control-Allow-Origin': '*' }
    },
    '/api/settings-schema': {
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
