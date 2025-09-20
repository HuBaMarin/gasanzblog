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
  runtimeConfig: {
    public: {
      contactEmail: 'info.leonardo@murialdo.net',
      contactPhone: '949277230',
    }
  },

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

  nitro: {
    compressPublicAssets: true,
    compatibilityDate: '2025-09-20',
    prerender: {
      routes: ['/api/data', '/api/data.json']
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/aviso-legal': { prerender: true },
    '/privacidad': { prerender: true },
    '/cookies': { prerender: true },
    '/entorno-seguro': { prerender: true },
    '/eventos': { isr: { expiration: 300 } },
    '/api/data': { prerender: true, cache: { maxAge: 300, swr: true } },
    '/api/data.json': { prerender: true, cache: { maxAge: 300, swr: true } },
    '/zona-segura': { redirect: { to: '/entorno-seguro', statusCode: 301 } }
  },

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'light'
  }
})