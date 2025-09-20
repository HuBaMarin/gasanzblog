<template>
  <Html :lang="'es'" :data-theme="$colorMode.value">
    <Body>
      <div class="layout-root">
        <!-- Header with navigation -->
        <SiteHeader />

        <!-- Main content -->
        <main id="main" class="main-content">
          <slot />
        </main>

        <!-- Footer -->
        <SiteFooter />
      </div>
    </Body>
  </Html>
</template>

<script setup lang="ts">
// Color mode is handled by @nuxtjs/color-mode module
// Default preference should be set in nuxt.config.ts
</script>

<style>
/* Global styles for the application */
html {
  height: 100%;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #ffffff;
  color: #111827;
  transition: background-color 0.3s ease, color 0.3s ease;
  font-size: 16px;
  line-height: 1.6;
}

/* Dark mode for body */
html[data-theme="dark"] body {
  background-color: #111827;
  color: #f9fafb;
}

/* Root container */
.layout-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

/* Site Title Bar */
.site-title-bar {
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 0;
  text-align: center;
}

html[data-theme="dark"] .site-title-bar {
  background-color: #0f172a;
  border-bottom-color: #1e293b;
}

.site-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
  font-family: 'Georgia', serif;
}

html[data-theme="dark"] .site-title {
  color: #f1f5f9;
}

/* Main content area */
.main-content {
  flex: 1 0 auto;
  width: 100%;
  padding: 0;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Center content containers */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container {
    padding: 0 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 3rem;
  }
}

/* Accessibility: focus-visible styling */
:where(a, button, [role="button"], input, select, textarea):focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}

/* Reduce motion for users who prefer fewer animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
</style>