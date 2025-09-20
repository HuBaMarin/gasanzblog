<template>
  <div class="page-content">
    <section class="sectionContainer">
    <header class="sectionHeader">
      <h1 class="title">Eventos</h1>
      <p class="subtitle">Los momentos más destacados de nuestras actividades y celebraciones</p>

      <div class="metaRow">
       

        <div class="spacer"></div>

        <button
          v-if="isAdmin"
          class="btn"
          :disabled="syncing"
          @click="syncNow"
        >
          {{ syncing ? 'Sincronizando…' : 'Sincronizar ahora' }}
        </button>

        
      </div>
    </header>

    <!-- Skeleton Loader -->
    <div v-if="pending" class="skeletonGrid">
      <div v-for="i in 6" :key="i" class="skeletonItem">
        <div class="skeletonThumb"></div>
        <div class="skeletonLine"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="errorBox">
      <p>No se pudieron cargar los eventos.</p>
    </div>

    <!-- Posts -->
    <div v-else-if="videoPosts.length" class="postsGrid">
      <article v-for="post in videoPosts" :key="post.id" class="card">
        <!-- Video -->
        <div class="videoContainer">
          <video
            v-if="getVideoUrl(post)"
            :src="getVideoUrl(post)"
            :poster="getImageUrl(post)"
            controls
            playsinline
            muted
            preload="metadata"
            class="video"
            @error="onVideoError($event, post)"
          />
        </div>

        <!-- Meta -->
        <footer class="cardFooter">
          <p v-if="post.caption" class="caption">{{ post.caption }}</p>

          <div class="meta">
            <span>{{ formatDate(post.timestamp) }}</span>
            <span class="dot">•</span>
            <span>@{{ post.ownerUsername }}</span>

            <span class="spacer"></span>

            <a
              :href="post.url"
              target="_blank"
              rel="noopener noreferrer"
              class="instagramLink"
              aria-label="Abrir en Instagram"
            >
              Ver en Instagram
            </a>
          </div>
        </footer>
      </article>
    </div>

    <!-- Empty -->
    <div v-else class="emptyState">
      <div class="emptyIcon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p class="emptyText">No hay publicaciones con video en este momento.</p>
    </div>
  </section>
  </div>
</template>

<script setup lang="ts">
interface Post {
  id: string
  type: string
  url: string
  displayUrl: string
  videoUrl?: string
  localVideoUrl?: string
  localDisplayUrl?: string
  likesCount: number
  commentsCount: number
  caption: string
  ownerUsername: string
  timestamp: string
}

const isAdmin = ref(false) // Cambia según tu sistema de auth
const syncing = ref(false)

const { data, pending, error, refresh } = await useFetch<{
  success: boolean
  mostLiked: Post[]
  cached: boolean
}>('/api/data?limit=30', {
  server: true, // Renderiza en SSR si está disponible
  lazy: true,   // Muestra el skeleton y carga
})

const posts = computed(() => data.value?.mostLiked || [])

// Preferimos usar archivos locales (localVideoUrl/localDisplayUrl).
const videoPosts = computed(() =>
  posts.value.filter(p => p.type === 'Video' && (p.localVideoUrl || p.videoUrl))
)

// URLs auxiliares
function getVideoUrl(post: Post): string {
  if (post.localVideoUrl) return post.localVideoUrl
  if (post.videoUrl) return proxy(post.videoUrl)
  return ''
}

function getImageUrl(post: Post): string {
  if (post.localDisplayUrl) return post.localDisplayUrl
  return proxy(post.displayUrl)
}

function proxy(url: string): string {
  return `/api/proxy?url=${encodeURIComponent(url)}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function onVideoError(ev: Event, post: Post): void {
  const el = ev.target as HTMLVideoElement
  if (!el) return
  if (post.videoUrl) {
    el.src = proxy(post.videoUrl)
    el.load()
    el.play?.().catch(() => {})
  }
}

async function syncNow() {
  try {
    syncing.value = true
    await $fetch('/api/media/sync')
    await refresh()
  } catch (e) {
    console.error('Error al sincronizar:', e)
  } finally {
    syncing.value = false
  }
}

useSeoMeta({
  title: 'Eventos',
  description: 'Los momentos más destacados de nuestras actividades y celebraciones.'
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

.sectionContainer {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

.sectionHeader {
  margin-bottom: 1.25rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

html[data-theme="dark"] .title {
  color: #f9fafb;
}

.subtitle {
  color: #6b7280;
  margin-top: 0.25rem;
}

html[data-theme="dark"] .subtitle {
  color: #9ca3af;
}

.metaRow {
  display: flex;
  align-items: center;
  margin-top: 0.75rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  font-size: .75rem;
  border-radius: 999px;
  padding: .25rem .6rem;
  border: 1px solid transparent;
}

.badge.success { 
  color: #047857; 
  background: #ecfdf5; 
  border-color: #a7f3d0; 
}

html[data-theme="dark"] .badge.success {
  color: #065f46;
  background: #064e3b;
  border-color: #047857;
}

.badge.warn { 
  color: #92400e; 
  background: #fffbeb; 
  border-color: #fde68a; 
}

html[data-theme="dark"] .badge.warn {
  color: #78350f;
  background: #451a03;
  border-color: #92400e;
}

.badge.tiny { 
  font-size: .65rem; 
  padding: .15rem .45rem; 
  background: #f3f4f6; 
  color: #374151; 
  border-color: #e5e7eb; 
}

html[data-theme="dark"] .badge.tiny {
  background: #374151;
  color: #d1d5db;
  border-color: #4b5563;
}

.btn {
  background: #111827;
  color: #fff;
  border: 1px solid #111827;
  border-radius: .5rem;
  padding: .5rem .75rem;
  font-size: .9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  background: #1f2937;
  transform: translateY(-1px);
}

html[data-theme="dark"] .btn {
  background: #f9fafb;
  color: #111827;
  border-color: #f9fafb;
}

html[data-theme="dark"] .btn:hover {
  background: #e5e7eb;
}

.btn.ghost {
  background: transparent;
  color: #111827;
  border: 1px solid #d1d5db;
  margin-left: .5rem;
}

.btn.ghost:hover {
  background: #f9fafb;
}

html[data-theme="dark"] .btn.ghost {
  background: transparent;
  color: #f9fafb;
  border-color: #4b5563;
}

html[data-theme="dark"] .btn.ghost:hover {
  background: #374151;
}

.btn[disabled] { 
  opacity: .6; 
  cursor: not-allowed; 
}

.spacer { 
  flex: 1 1 auto; 
}

.skeletonGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.skeletonItem {
  border: 1px solid #e5e7eb;
  border-radius: .75rem;
  overflow: hidden;
  padding: .75rem;
  background: #ffffff;
}

html[data-theme="dark"] .skeletonItem {
  border-color: #374151;
  background: #1f2937;
}

.skeletonThumb {
  height: 280px;
  background: linear-gradient(90deg, #f3f4f6, #e5e7eb, #f3f4f6);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  border-radius: .5rem;
}

html[data-theme="dark"] .skeletonThumb {
  background: linear-gradient(90deg, #374151, #4b5563, #374151);
}

.skeletonLine {
  height: 12px;
  margin-top: .75rem;
  width: 70%;
  background: #f3f4f6;
  border-radius: 6px;
}

html[data-theme="dark"] .skeletonLine {
  background: #374151;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Error States */
.errorBox {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1.5rem;
  border-radius: .75rem;
  text-align: center;
}

html[data-theme="dark"] .errorBox {
  background: #7f1d1d;
  border-color: #991b1b;
  color: #fecaca;
}

/* Posts Grid */
.postsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.card {
  border: 1px solid #e5e7eb;
  border-radius: .75rem;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

html[data-theme="dark"] .card {
  border-color: #374151;
  background: #1f2937;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

html[data-theme="dark"] .card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Video Container - Fixed Size */
.videoContainer {
  position: relative;
  background: #000;
  width: 100%;
  height: 280px;
  overflow: hidden;
  flex-shrink: 0;
}

.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
}

.video:hover {
  transform: scale(1.02);
}

/* Card Content */
.cardFooter {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.caption {
  font-weight: 500;
  margin: 0 0 .75rem;
  color: #111827;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

html[data-theme="dark"] .caption {
  color: #f9fafb;
}

.meta {
  color: #6b7280;
  font-size: .85rem;
  display: flex;
  align-items: center;
  margin-top: auto;
  flex-wrap: wrap;
  gap: .5rem;
}

html[data-theme="dark"] .meta {
  color: #9ca3af;
}

.dot {
  margin: 0 .5rem;
  color: #d1d5db;
}

.instagramLink {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: #3b82f6;
  border: 1px solid #3b82f6;
  padding: .35rem .6rem;
  border-radius: .375rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.instagramLink:hover {
  background: #2563eb;
  border-color: #2563eb;
}

html[data-theme="dark"] .instagramLink {
  color: #111827;
  background: #93c5fd;
  border-color: #93c5fd;
}

html[data-theme="dark"] .instagramLink:hover {
  background: #60a5fa;
  border-color: #60a5fa;
}

.emptyState {
  text-align: center;
  color: #6b7280;
  padding: 4rem 2rem;
}

html[data-theme="dark"] .emptyState {
  color: #9ca3af;
}

.emptyIcon {
  width: 56px;
  margin: 0 auto 1.5rem;
  color: #9ca3af;
}

html[data-theme="dark"] .emptyIcon {
  color: #6b7280;
}

.emptyIcon svg { 
  width: 56px; 
  height: 56px; 
}

.emptyText {
  font-size: 1.125rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .sectionContainer {
    padding: 1.5rem 1rem 2rem;
  }
  
  .title {
    font-size: 1.75rem;
  }
  
  .postsGrid,
  .skeletonGrid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .videoContainer {
    height: 240px;
  }
  
  .metaRow {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .btn.ghost {
    margin-left: 0;
  }
}

@media (max-width: 640px) {
  .videoContainer {
    height: 200px;
  }
  
  .cardFooter {
    padding: 0.75rem;
  }
  
  .meta {
    font-size: 0.8rem;
  }
}
</style>