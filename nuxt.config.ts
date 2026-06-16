import tailwindcss from "@tailwindcss/vite";

const apiBase = process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api'
const apiOrigin = apiBase.replace(/\/api\/?$/, '').replace(/\/+$/, '')

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
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api',
      /** Link invite grup WA tagihan, contoh: https://chat.whatsapp.com/xxxxx */
      waGroupLink: process.env.NUXT_PUBLIC_WA_GROUP_LINK ?? '',
    }
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: " + apiOrigin,
          "connect-src 'self' " + apiOrigin + " ws://localhost:3000 ws://127.0.0.1:3000 ws://localhost:24678",
          "font-src 'self' data:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
    },
  },

  eslint: {
    checker: {
      lintOnStart: true,
      emitWarning: true,
      emitError: true,
      /** Setara failOnWarning — warning di dev diperlakukan sebagai error */
      emitWarningAsError: true,
    },
  },
})