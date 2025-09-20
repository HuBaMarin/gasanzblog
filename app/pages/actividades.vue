<template>
  <section class="page-section">
    <div class="container">
      <h1 class="page-title">Actividades</h1>

      <p class="lead-text">
        Inspirados por San Leonardo Murialdo, acompañamos a jóvenes y adultos en su crecimiento humano, espiritual y laboral.
      </p>

      <div class="section">
        <h2 class="section-title">Para quién trabajamos</h2>

        <div class="subsection">
          <h3 class="subsection-title">
            <Icon name="heroicons:user-group" class="icon" />
            Jóvenes
          </h3>
          <p class="text">
            Impulsamos procesos formativos y comunitarios para jóvenes, fomentando su participación, liderazgo y proyecto de vida.
          </p>
        </div>

        <div class="subsection">
          <h3 class="subsection-title">
            <Icon name="heroicons:briefcase" class="icon" />
            Desempleados
          </h3>
          <p class="text">
            Formación para el empleo y primer paso hacia la formación dual. Acompañamos a cada persona en su integración al mercado
            laboral con eficacia y profesionalidad, en colaboración con empresas y entidades formativas.
          </p>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Formación para el empleo</h2>
        <p class="text">
          Nuestro reto como centros de formación para el empleo es acompañar con eficacia a cada trabajador en su inserción
          laboral. Las empresas son agentes necesarios en el proceso formativo y entidades promotoras en el mercado de trabajo.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Qué hacemos',
  description: 'Acompañamiento a jóvenes, formación para el empleo y vida comunitaria inspirada por San Leonardo Murialdo.'
})
</script>

<style scoped>
.page-section { padding: 2rem 0; }

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #111827;
}

.lead-text {
  font-size: 1.125rem;
  color: #4b5563;
  line-height: 1.75;
  margin-bottom: 2rem;
}

.section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.subsection {
  margin: 1.5rem 0;
  padding-left: 1rem;
}

.subsection-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.text {
  color: #4b5563;
  line-height: 1.75;
}

/* Dark mode */
html[data-theme="dark"] .page-title { color: #f9fafb; }
html[data-theme="dark"] .lead-text { color: #d1d5db; }
html[data-theme="dark"] .section { border-top-color: #374151; }
html[data-theme="dark"] .section-title { color: #e5e7eb; }
html[data-theme="dark"] .subsection-title { color: #e5e7eb; }
html[data-theme="dark"] .icon { color: #9ca3af; }
html[data-theme="dark"] .text { color: #d1d5db; }

/* Responsive */
@media (max-width: 640px) {
  .page-title {
    font-size: 1.875rem;
  }
  
  .subsection {
    padding-left: 0.5rem;
  }
}
</style>