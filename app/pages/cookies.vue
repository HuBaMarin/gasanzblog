<template>
  <div class="legal-page">
    <div class="container">
      <h1>Política de cookies</h1>

      <h2>Tipos de cookies que usamos</h2>
      <ul>
        <li><strong>Técnicas</strong>: imprescindibles para el funcionamiento básico del sitio y la seguridad.</li>
        <li><strong>Preferencias</strong>: recuerdan opciones como el tema (claro/oscuro)</li>
      </ul>

      <h2>Cómo gestionar las cookies</h2>
      <p>
        Puede configurar su navegador para aceptar o rechazar cookies, o para que le avise antes de su instalación.
        También puede eliminar las cookies existentes desde los ajustes de su navegador.
      </p>

      <h2>Cookies y terceros</h2>
      <p>
        En la sección de eventos puede encontrar enlaces a contenidos de <strong>Instagram</strong>. Cuando acceda a instagram.com se aplicarán sus propias políticas de cookies y privacidad.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const siteName = appConfig.site?.name || 'Parroquia'

useSeoMeta({
  title: 'Política de cookies',
  description: `Política de cookies de ${siteName}`,
  ogTitle: 'Política de cookies',
  ogDescription: `Política de cookies de ${siteName}`
})
</script>

<style>
.legal-page { padding: 2rem 0; }
.legal-page h1 { margin: 0 0 1rem; font-size: 2rem; }
.legal-page h2 { margin: 2rem 0 0.5rem; font-size: 1.25rem; }
.legal-page p, .legal-page li { color: #4b5563; }

html[data-theme="dark"] .legal-page p,
html[data-theme="dark"] .legal-page li { color: #d1d5db; }
</style>
