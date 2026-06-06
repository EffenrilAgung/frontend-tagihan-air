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
     * Nuxt 4: komponen shadcn ada di app/components/ui
     */
    componentDir: './app/components/ui',
  },

  vite: {
    plugins: [
      tailwindcss()
    ],
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@vueuse/core',
        'class-variance-authority',
        'clsx',
        'lucide-vue-next',
        'reka-ui',
        'tailwind-merge',
        'vue-sonner',
      ],
    },
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
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api'
    }
  }
})