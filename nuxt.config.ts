export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/color-mode',
  ],
  // Public/Private runtime configuration
  runtimeConfig: {
    public: {
      contactEmail: 'info.leonardo@murialdo.net',
      contactPhone: '949277230',
    }
  },

  // Nuxt Image configuration for better performance
  image: {
    quality: 80,
    screens: {
      sm: 320,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    }
  },

  // Nitro: compress static/public assets in production
  nitro: {
    compressPublicAssets: true,
    compatibilityDate: '2025-09-20'
  },

  // Prerender key static routes for faster delivery
  routeRules: {
    '/': { prerender: true },
    '/aviso-legal': { prerender: true },
    '/privacidad': { prerender: true },
    '/cookies': { prerender: true },
    '/entorno-seguro': { prerender: true },
    '/zona-segura': { redirect: { to: '/entorno-seguro', statusCode: 301 } }
  },

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'light'
  }
})