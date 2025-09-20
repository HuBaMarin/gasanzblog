<template>
  <div class="page-content">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">Parroquia Santa Cruz Murialdo</h1>
          <div class="hero-quote">
            <blockquote>
              "El hombre que reza es el más poderoso del mundo"
            </blockquote>
            <cite>San Leonardo Murialdo</cite>
          </div>
        </div>
      </div>
    </section>

    
    <section class="quote-section">
      <div class="container">
        <div class="quote-card">
          <div class="quote-text">
            "La oración es el alma y la fuerza del hombre. Hágase con humildad, confianza y perseverancia"
          </div>
          <div class="quote-author">— San Leonardo Murialdo</div>
        </div>
      </div>
    </section>
    
      <p class="hero-description">
        Somos una comunidad inspirada por San Leonardo Murialdo. Acompañamos a las personas —especialmente a los jóvenes—
        en su crecimiento humano y espiritual, y promovemos la formación y el servicio como camino de vida cristiana.
      </p>
    
    
  </div>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const siteName = appConfig.site?.author?.name

useSeoMeta({
  title: `${siteName} — Inicio`,
  ogTitle: `${siteName} — Inicio`,
  description: 'Comunidad parroquial, formación y acompañamiento inspirados por San Leonardo Murialdo.',
  ogDescription: 'Comunidad parroquial, formación y acompañamiento inspirados por San Leonardo Murialdo.'
})
</script>

<style>
.page-content {
  background-color: #ffffff;
  color: #111827;
}

html[data-theme="dark"] .page-content {
  background-color: #111827;
  color: #f9fafb;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #ffffff 100%);
  padding: 4rem 0;
  text-align: center;
}

html[data-theme="dark"] .hero {
  background: #0f172a;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 2rem 0;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.hero-quote {
  margin: 2rem 0;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border-left: 4px solid #3b82f6;
}

html[data-theme="dark"] .hero-quote {
  background: rgba(31, 41, 55, 0.8);
  border-left-color: #60a5fa;
}

.hero-quote blockquote {
  font-size: 1.5rem;
  font-style: italic;
  font-weight: 500;
  margin: 0 0 1rem 0;
  color: #1f2937;
}

html[data-theme="dark"] .hero-quote blockquote {
  color: #f9fafb;
}

.hero-quote cite {
  font-size: 1rem;
  color: #6b7280;
  font-weight: 600;
}

html[data-theme="dark"] .hero-quote cite {
  color: #9ca3af;
}

.hero-description {
  font-size: 1.25rem;
  color: #4b5563;
  line-height: 1.7;
  margin: 2rem 0 0 0;
}

html[data-theme="dark"] .hero-description {
  color: #d1d5db;
  text-align: justify;
  margin: 2rem 0 0 0;
  font-size: 1.25rem;
  line-height: 1.7;
  
}

/* Quote Section */
.quote-section {
  padding: 3rem 0;
  background: #f8fafc;
}

html[data-theme="dark"] .quote-section {
  background: #0f172a;
}

.quote-card {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

html[data-theme="dark"] .quote-card {
  background: #1f2937;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.quote-text {
  font-size: 1.5rem;
  font-style: italic;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.6;
}

html[data-theme="dark"] .quote-text {
  color: #f9fafb;
}

.quote-author {
  font-size: 1.125rem;
  font-weight: 600;
  color: #3b82f6;
}

html[data-theme="dark"] .quote-author {
  color: #60a5fa;
}

/* Sections */
.areas, .values {
  padding: 4rem 0;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 3rem 0;
  color: #1f2937;
}

html[data-theme="dark"] .section-title {
  color: #f9fafb;
}

/* Areas Grid */
.areas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.area-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.area-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
}

html[data-theme="dark"] .area-card {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

html[data-theme="dark"] .area-card:hover {
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.3);
}

.area-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  background: #eff6ff;
  border-radius: 50%;
  margin: 0 auto 1.5rem auto;
  color: #3b82f6;
}

html[data-theme="dark"] .area-icon {
  background: #1e3a8a;
  color: #60a5fa;
}

.area-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #1f2937;
}

html[data-theme="dark"] .area-title {
  color: #f9fafb;
}

.area-description {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.7;
  margin: 0;
}

html[data-theme="dark"] .area-description {
  color: #d1d5db;
}

/* Values Section */
.values {
  background: #f8fafc;
}

html[data-theme="dark"] .values {
  background: #0f172a;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.value-item {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

html[data-theme="dark"] .value-item {
  background: #1f2937;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.value-item h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #3b82f6;
}

html[data-theme="dark"] .value-item h4 {
  color: #60a5fa;
}

.value-item p {
  font-size: 0.95rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

html[data-theme="dark"] .value-item p {
  color: #d1d5db;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.25rem;
  }
  
  .hero-quote blockquote {
    font-size: 1.25rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .areas-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-content {
    padding: 0 1rem;
  }
  
  .quote-card {
    padding: 2rem 1.5rem;
  }
}
</style>
