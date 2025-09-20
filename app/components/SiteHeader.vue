<template>
  <header class="site-header">
    <div class="inner">
      <div class="header-left">
        <!-- Mobile menu toggle -->
        <button
          class="menu-toggle"
          type="button"
          :aria-expanded="mobileOpen ? 'true' : 'false'"
          aria-controls="primary-nav"
          :aria-label="mobileOpen ? 'Cerrar menú' : 'Abrir menú'"
          @click="mobileOpen = !mobileOpen"
        >
          <Icon v-if="!mobileOpen" name="heroicons:bars-3-20-solid" size="22" />
          <Icon v-else name="heroicons:x-mark-20-solid" size="22" />
        </button>
      </div>

      <nav id="primary-nav" aria-label="Principal">
        <ul class="nav">
          <li v-for="item in nav" :key="item.to">
            <NuxtLink :to="item.to" class="nav-link" :class="{ 'router-link-active': $route.path === item.to }" :aria-current="$route.path === item.to ? 'page' : undefined">
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="header-right">
        <div class="contact">
          <a v-if="contactPhone" :href="`tel:${contactPhone}`" class="contact-link" aria-label="Llamar por teléfono">
            <Icon name="heroicons:phone-20-solid" size="18" />
            <span class="contact-text">{{ humanPhone }}</span>
          </a>
          <a v-if="contactEmail" :href="`mailto:${contactEmail}`" class="contact-link" aria-label="Enviar correo">
            <Icon name="heroicons:envelope-20-solid" size="18" />
            <span class="hidden lg:inline">{{ contactEmail }}</span>
          </a>
        </div>

        <button
          class="toggle"
          type="button"
          :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          @click="toggleColorMode"
        >
          <ClientOnly>
            <Icon v-if="isDark" name="heroicons:sun-20-solid" size="20" />
            <Icon v-else name="heroicons:moon-20-solid" size="20" />
            <template #fallback>
              <!-- Fallback to prevent layout shift -->
              <div style="width: 1.25rem; height: 1.25rem;"></div>
            </template>
          </ClientOnly>
          <span class="sr-only">Tema</span>
        </button>
      </div>
    </div>

    <!-- Mobile dropdown -->
    <div v-show="mobileOpen && isMobile" class="mobile-menu" @click.self="mobileOpen = false">
      <nav aria-label="Menú móvil" class="mobile-panel" role="dialog" aria-modal="true">
        <ul class="mobile-nav">
          <li v-for="item in nav" :key="`m-${item.to}`">
            <NuxtLink :to="item.to" class="mobile-link" @click="mobileOpen = false" :class="{ active: $route.path === item.to }" :aria-current="$route.path === item.to ? 'page' : undefined">
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>

        <div class="mobile-contact">
          <a v-if="contactPhone" :href="`tel:${contactPhone}`" class="contact-link">
            <Icon name="heroicons:phone-20-solid" size="18" />
            <span>{{ humanPhone }}</span>
          </a>
          <a v-if="contactEmail" :href="`mailto:${contactEmail}`" class="contact-link">
            <Icon name="heroicons:envelope-20-solid" size="18" />
            <span>{{ contactEmail }}</span>
          </a>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const nav = appConfig.site?.nav || []

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
function toggleColorMode() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

// Contact from runtime config
const config = useRuntimeConfig()
const contactEmail = config.public.contactEmail as string
const contactPhone = config.public.contactPhone as string
const humanPhone = computed(() => {
  // beautify common ES format +34XXXXXXXXX -> 626 915 018
  const digits = (contactPhone || '').replace(/[^0-9]/g, '')
  if (digits.length >= 9) {
    return `${digits.slice(-9, -6)} ${digits.slice(-6, -3)} ${digits.slice(-3)}`
  }
  return contactPhone
})

// Mobile state
const mobileOpen = ref(false)
const isMobile = ref(false)

// Close menu on route change
const route = useRoute()
watch(() => route.fullPath, () => { mobileOpen.value = false })

// Track viewport to ensure mobile menu is only used on mobile
let mql: MediaQueryList | null = null
function updateIsMobile() {
  if (!mql) return
  isMobile.value = mql.matches
  if (!isMobile.value) mobileOpen.value = false
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    mql = window.matchMedia('(max-width: 1023.98px)')
    mql.addEventListener('change', updateIsMobile)
    updateIsMobile()
    // Close on Escape key
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') mobileOpen.value = false
    })
  }
})

onBeforeUnmount(() => {
  if (mql) mql.removeEventListener('change', updateIsMobile)
})
</script>

<style>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

html[data-theme="dark"] .site-header {
  border-bottom-color: #374151;
  background-color: #111827;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.5);
}

.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.0rem;
  max-width: 1280px;
  margin: 0 auto;
  gap: .5rem;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.brand { 
  display: inline-flex; 
  align-items: center; 
  gap: .5rem; 
  text-decoration: none; 
}

.brand-name { 
  font-weight: 700; 
  color: #111827; 
}

html[data-theme="dark"] .brand-name { 
  color: #f9fafb; 
}

.menu-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
}

.menu-toggle:hover { 
  background: #f3f4f6; 
}

html[data-theme="dark"] .menu-toggle { 
  border-color: #374151; 
  background: #1f2937; 
  color: #f9fafb; 
}

html[data-theme="dark"] .menu-toggle:hover { 
  background: #374151; 
}

.header-center {
  flex: 1 1 auto;
  justify-content: center;
}

.header-right {
  justify-content: flex-end;
  gap: 0.5rem;
}

.contact { display: inline-flex; align-items: center; gap: .75rem; margin-right: .25rem; }
.contact-link { 
  display: inline-flex; 
  align-items: center; 
  gap: .375rem; 
  color: #4b5563; 
  text-decoration: none; 
  font-size: .875rem; 
}

.contact-link:hover { 
  color: #111827; 
}

html[data-theme="dark"] .contact-link { 
  color: #cbd5e1; 
}

html[data-theme="dark"] .contact-link:hover { 
  color: #f8fafc; 
}

.nav {
  display: flex;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav a { 
  color: #4b5563; 
  text-decoration: none; 
  font-weight: 500; 
  padding: 0.5rem 0; 
  position: relative; 
}

.nav a.router-link-active { 
  color: #3b82f6; 
}

html[data-theme="dark"] .nav a { 
  color: #e5e7eb; 
}

html[data-theme="dark"] .nav a.router-link-active { 
  color: #60a5fa; 
}

.toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle:hover { 
  background: #f3f4f6; 
  transform: scale(1.05); 
}

html[data-theme="dark"] .toggle { 
  border-color: #374151; 
  background: #1f2937; 
  color: #f9fafb; 
}

html[data-theme="dark"] .toggle:hover { 
  background: #374151; 
}

.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }

/* Mobile menu */
.mobile-menu { position: fixed; inset: 0; background: rgba(0,0,0,.4); backdrop-filter: blur(2px); }
.mobile-panel { 
  position: absolute; 
  top: 64px; 
  left: 0; 
  right: 0; 
  background: #ffffff; 
  border-top: 1px solid #e5e7eb; 
  box-shadow: 0 10px 25px rgba(0,0,0,.1); 
  padding: .75rem 1rem; 
}

html[data-theme="dark"] .mobile-panel { 
  background: #111827; 
  border-color: #374151; 
  box-shadow: 0 10px 25px rgba(0,0,0,.5); 
}

.mobile-nav { 
  list-style: none; 
  margin: 0; 
  padding: 0; 
  display: grid; 
  gap: .5rem; 
}

.mobile-link { 
  display: block; 
  padding: .5rem .25rem; 
  color: #111827; 
  text-decoration: none; 
  font-weight: 600; 
}

.mobile-link:hover { 
  color: #2563eb; 
}

.mobile-link.active { 
  color: #3b82f6; 
}

html[data-theme="dark"] .mobile-link { 
  color: #f9fafb; 
}

html[data-theme="dark"] .mobile-link:hover { 
  color: #60a5fa; 
}

.mobile-contact { 
  display: grid; 
  gap: .5rem; 
  padding-top: .5rem; 
  border-top: 1px dashed #e5e7eb; 
  margin-top: .5rem; 
}

html[data-theme="dark"] .mobile-contact { 
  border-top-color: #374151; 
}

/* Responsive visibility rules */
@media (max-width: 1023px) {
  /* Hide desktop nav on mobile */
  #primary-nav { display: none; }
}

@media (min-width: 1024px) {
  /* Hide hamburger and overlay on desktop */
  .menu-toggle { display: none; }
  .mobile-menu { display: none !important; }
}
</style>
