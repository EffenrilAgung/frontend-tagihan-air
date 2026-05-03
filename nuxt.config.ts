import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-04-22',
  devtools: { enabled: true },
  devServer: {
    port: 3000,
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/icon',
    'shadcn-nuxt'
  ],

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },

  vite: {
    plugins: [
      tailwindcss()
    ],
  },

  // Enable pages mode
  pages: true,

  // Add any additional configuration if needed
  css: [
    '~/assets/css/main.css'
  ],

  imports: {
    dirs: [
      '~/composables/**',
    ]
  },

  // API Laravel: set NUXT_PUBLIC_API_BASE_URL di .env (lihat .env.example)
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? ''
    }
  }
})