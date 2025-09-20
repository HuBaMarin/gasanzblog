<template>
  <div class="legal-page">
    <div class="container">
      <h1>Aviso legal</h1>
      <p>
        Este sitio web pertenece a <strong>{{ siteName }}</strong>.
      </p>

      <h2>Condiciones de uso</h2>
      <p>
        El acceso y uso de este sitio implica la aceptación de estas condiciones y de la normativa aplicable.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        Salvo que se indique lo contrario, los contenidos (textos, imágenes, logotipos) son propiedad de {{ siteName }} o de sus legítimos titulares y se publican con autorización.
        No se permite su reproducción o difusión sin autorización previa.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        No nos hacemos responsables del uso indebido de los contenidos ni de los daños derivados del acceso o uso de la web.
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
  title: 'Aviso legal',
  description: `Información legal del sitio ${siteName}`,
  ogTitle: 'Aviso legal',
  ogDescription: `Información legal del sitio ${siteName}`
})
</script>

<style>
.legal-page { padding: 2rem 0; }
.legal-page h1 { margin: 0 0 1rem; font-size: 2rem; }
.legal-page h2 { margin: 2rem 0 0.5rem; font-size: 1.25rem; }
.legal-page p { color: #4b5563; }

html[data-theme="dark"] .legal-page p { color: #d1d5db; }
</style>
