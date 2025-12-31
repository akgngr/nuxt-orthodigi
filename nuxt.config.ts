// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  devtools: {
    enabled: true
  },

  imports: {
    dirs: ['stores']
  },
  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    betterAuthUrl: process.env.BETTER_AUTH_URL,
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL
    }
  },
  compatibilityDate: '2024-11-01',

  nitro: {
    esbuild: {
      options: {
        target: 'es2022'
      }
    }
  },

  vite: {
    build: {
      target: 'es2022'
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
