<template>
  <div class="legal-page">
    <div class="container">
      <h1>Entorno seguro</h1>
      <p>
        En <strong>{{ siteName }}</strong> promovemos un entorno seguro para menores y personas vulnerables, basado en el respeto,
        la prevención y la tolerancia cero ante cualquier forma de abuso o maltrato.
      </p>

      <h2>Principios de actuación</h2>
      <ul>
        <li>Compromiso expreso con la protección de menores y personas vulnerables.</li>
        <li>Prevención y detección temprana de posibles situaciones de riesgo.</li>
        <li>Acompañamiento adecuado y respuesta diligente ante cualquier incidencia.</li>
        <li>Confidencialidad y respeto de los derechos de las personas afectadas.</li>
      </ul>

      <h2>Cómo actuar</h2>
      <p>
        Si detecta una situación de riesgo, maltrato o abuso, por favor contacte con nosotros a la mayor brevedad.
        Su comunicación será atendida con confidencialidad. También puede dirigirse a los canales de protección de su
        diócesis u organismos públicos de protección del menor.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const siteName = appConfig.site?.name || 'Parroquia'
const config = useRuntimeConfig()
const contactEmail = config.public.contactEmail as string
const contactPhone = config.public.contactPhone as string

const humanPhone = computed(() => {
  const digits = (contactPhone || '').replace(/[^0-9]/g, '')
  if (digits.length >= 9) return `${digits.slice(-9, -6)} ${digits.slice(-6, -3)} ${digits.slice(-3)}`
  return contactPhone
})

useSeoMeta({
  title: 'Entorno seguro',
  description: `Principios y canales de contacto para un entorno seguro en ${siteName}`,
  ogTitle: 'Entorno seguro',
  ogDescription: `Principios y canales de contacto para un entorno seguro en ${siteName}`
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
