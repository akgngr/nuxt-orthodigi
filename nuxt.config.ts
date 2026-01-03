// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    './modules/pages',
    './modules/blog',
    './modules/products',
    './modules/doctorprofile',
    './modules/doctortestimonial',
    './modules/forms'
  ],
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  imports: {
    dirs: ['stores']
  },

  devtools: {
    enabled: true
  },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    betterAuthUrl: process.env.BETTER_AUTH_URL,
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL
    }
  },

  routeRules: {
    '/': { prerender: true }
  },
  compatibilityDate: '2026-01-02',

  nitro: {
    compatibilityDate: '2026-01-02',
    esbuild: {
      options: {
        target: 'es2022'
      }
    }
  },

  vite: {
    build: {
      target: 'es2022'
    },
    server: {
      hmr: {
        port: 24679
      }
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
