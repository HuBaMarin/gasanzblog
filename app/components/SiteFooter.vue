<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-left">
        <p v-if="author" class="author">
          <strong>{{ author.name }}</strong>
        </p>
        <p class="copyright">© {{ year }} {{ author?.name}}. Todos los derechos reservados.</p>
        <nav aria-label="Enlaces legales" class="legal">
          <NuxtLink to="/aviso-legal">Aviso legal</NuxtLink>
          <span class="sep" aria-hidden="true">·</span>
          <NuxtLink to="/privacidad">Privacidad</NuxtLink>
          <span class="sep" aria-hidden="true">·</span>
          <NuxtLink to="/cookies">Cookies</NuxtLink>
          <span class="sep" aria-hidden="true">·</span>
          <NuxtLink to="/entorno-seguro">Entorno seguro</NuxtLink>
        </nav>
      </div>

      <div class="footer-right">
        <ul class="social" aria-label="Redes parroquia">
          <li v-if="instagram">
            <a :href="instagram" target="_blank" rel="noopener" aria-label="Instagram parroquia">
              <Icon name="mdi:instagram" size="20" />
              <span class="sr-only">Instagram parroquia</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const instagram = appConfig.site?.social?.instagram
const author = appConfig.site?.author
const year = new Date().getFullYear()
</script>

<style>
.site-footer { 
  border-top: 1px solid #eee; 
  padding: 1rem; 
  background: #fafafa; 
  flex-shrink: 0;
  margin-top: auto;
}

.footer-inner { 
  display: flex; 
  align-items: start; 
  justify-content: space-between; 
  gap: 1rem; 
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-left { 
  display: grid; 
  gap: .25rem; 
  max-width: 65ch; 
}

.author { 
  color: #4b5563; 
  margin: 0; 
}

.copyright {
  color: #6b7280;
  margin: 0;
  font-size: .875rem;
}

.legal {
  display: flex;
  flex-wrap: wrap;
  gap: .25rem;
  margin-top: .25rem;
}

.legal a { color: #4b5563; text-decoration: none; }
.legal a:hover { color: #111827; text-decoration: underline; }

.sep { 
  opacity: .6; 
  padding: 0 .25rem; 
}

.social { 
  display: flex; 
  gap: .75rem; 
  list-style: none; 
  margin: 0; 
  padding: 0; 
}

.social a {
  color: #6b7280;
  transition: color 0.2s ease;
}

.social a:hover {
  color: #111827;
}

.sr-only { 
  position: absolute; 
  width: 1px; 
  height: 1px; 
  padding: 0; 
  margin: -1px; 
  overflow: hidden; 
  clip: rect(0,0,0,0); 
  border: 0; 
}

html[data-theme="dark"] .site-footer {
  border-top-color: #374151;
  background: #111827;
}

html[data-theme="dark"] .author {
  color: #d1d5db;
}

html[data-theme="dark"] .copyright { color: #9ca3af; }

html[data-theme="dark"] .legal a { color: #cbd5e1; }
html[data-theme="dark"] .legal a:hover { color: #f9fafb; }

html[data-theme="dark"] .social a {
  color: #9ca3af;
}

html[data-theme="dark"] .social a:hover {
  color: #f9fafb;
}

@media (max-width: 640px) {
  .footer-inner { flex-direction: column; align-items: stretch; }
}
</style>
