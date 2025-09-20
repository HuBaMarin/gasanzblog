<template>
  <section class="page-section">
    <div class="container">
      <h1 class="page-title">Contacto</h1>
      <p class="lead-text">
        Para cualquier consulta, puede escribirnos o llamarnos. También puede utilizar los accesos directos de la cabecera.
      </p>
      <div class="contact-block">
        <a v-if="contactEmail" :href="`mailto:${contactEmail}`" class="contact-link">
          <Icon name="heroicons:envelope-20-solid" size="20" />
          <span>{{ contactEmail }}</span>
        </a>
        <a v-if="contactPhone" :href="`tel:${contactPhone}`" class="contact-link">
          <Icon name="heroicons:phone-20-solid" size="20" />
          <span>{{ humanPhone }}</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const contactEmail = config.public.contactEmail as string
const contactPhone = config.public.contactPhone as string

// Format phone number for display
const humanPhone = computed(() => {
  const digits = (contactPhone || '').replace(/[^0-9]/g, '')
  if (digits.length >= 9) {
    return `${digits.slice(-9, -6)} ${digits.slice(-6, -3)} ${digits.slice(-3)}`
  }
  return contactPhone
})

useSeoMeta({
  title: 'Contacto',
  description: 'Información de contacto y vías de comunicación.',
  ogTitle: 'Contacto',
  ogDescription: 'Información de contacto y vías de comunicación.'
})
</script>

<style>
.page-section { padding: 2rem 0; }
.page-title { font-size: 2rem; font-weight: 700; margin: 0 0 1rem 0; }
.lead-text { color: #4b5563; margin: 0 0 1.5rem 0; }
.contact-block { display: grid; gap: .75rem; }
.contact-link { display: inline-flex; align-items: center; gap: .5rem; color: #111827; text-decoration: none; }
.contact-link:hover { text-decoration: underline; color: #2563eb; }

html[data-theme="dark"] .lead-text { color: #d1d5db; }
html[data-theme="dark"] .contact-link { color: #f9fafb; }
</style>