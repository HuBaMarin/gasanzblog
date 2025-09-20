<template>
  <div class="legal-page">
    <div class="container">
      <h1>Política de privacidad</h1>
      <p>En <strong>{{ siteName }}</strong> tratamos los datos personales conforme al RGPD y la LOPDGDD, aplicando principios de licitud, lealtad y transparencia.</p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        {{ siteName }} · Contacto: <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
        · Tel: <a :href="`tel:${contactPhone}`">{{ humanPhone }}</a>
      </p>

      <h2>2. Finalidades del tratamiento</h2>
      <ul>
        <li>Publicación de información y contenidos pastorales y comunitarios en el sitio web.</li>
        <li>Atender consultas que nos lleguen por correo electrónico.</li>
        <li>Garantizar la seguridad y el funcionamiento del sitio (logs técnicos del servidor).</li>
        <li>Recordar preferencias de visualización (por ejemplo, tema claro/oscuro).</li>
      </ul>

      <h2>3. Base jurídica</h2>
      <ul>
        <li>Consentimiento para atender comunicaciones que usted nos dirija.</li>
        <li>Interés legítimo en mantener la seguridad y el funcionamiento del servicio.</li>
        <li>Cumplimiento de obligaciones legales, cuando proceda.</li>
      </ul>

      <h2>4. Categorías de datos tratados</h2>
      <ul>
        <li>Datos identificativos mínimos cuando se comunica con nosotros por email (dirección de correo y contenido del mensaje).</li>
        <li>Datos técnicos de navegación en logs del servidor (dirección IP, marca temporal, user-agent) para seguridad.</li>
        <li>Preferencias de visualización (tema). Esta preferencia puede almacenarse en una cookie o en almacenamiento local del navegador.</li>
        <li>No utilizamos formularios web ni realizamos analítica de comportamiento en este sitio.</li>
      </ul>

      <h2>5. Plazos de conservación</h2>
      <p>Mantendremos los datos durante el tiempo estrictamente necesario para la finalidad indicada, o los exigidos por la normativa aplicable y los plazos de prescripción de posibles responsabilidades.</p>

      <h2>6. Destinatarios y transferencias</h2>
      <ul>
        <li>No se ceden datos a terceros, salvo obligación legal o prestadores de servicios (p. ej., alojamiento y mantenimiento) con los que se han suscrito contratos de encargo de tratamiento.</li>
        <li>En la sección de eventos se enlaza a contenidos de <strong>Instagram</strong>. Al abandonar nuestro sitio para visitar instagram.com, se aplican sus propias políticas.</li>
      </ul>

      <h2>7. Derechos de las personas</h2>
      <p>Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad dirigiéndose a nuestro contacto indicado arriba.</p>

      <h2>8. Reclamación ante la autoridad de control</h2>
      <p>Si considera que no se han atendido adecuadamente sus derechos, puede presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) en <a href="https://www.aepd.es" target="_blank" rel="noopener">aepd.es</a>.</p>

      <p>Para información sobre el uso de cookies y tecnologías similares, consulte nuestra <NuxtLink to="/cookies">Política de cookies</NuxtLink>.</p>
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
  title: 'Política de privacidad',
  description: `Política de privacidad de ${siteName}`,
  ogTitle: 'Política de privacidad',
  ogDescription: `Política de privacidad de ${siteName}`
})
</script>

<style>
.legal-page { padding: 2rem 0; }
.legal-page h1 { margin: 0 0 1rem; font-size: 2rem; }
.legal-page h2 { margin: 2rem 0 0.5rem; font-size: 1.25rem; }
.legal-page p { color: #4b5563; }
html[data-theme="dark"] .legal-page p { color: #d1d5db; }
</style>
