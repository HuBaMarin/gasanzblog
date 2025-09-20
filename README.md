
# Parroquia Santa Cruz Murialdo

Sitio web de la Parroquia Santa Cruz Murialdo construido con Nuxt 4 y Vue 3. Incluye páginas informativas, área de eventos con vídeos/imágenes y páginas legales básicas.


## Secciones principales

- Inicio (`/`)
- Actividades (`/actividades`)
- Eventos (`/eventos`)
- Entorno seguro (`/entorno-seguro`)
- Aviso legal (`/aviso-legal`)
- Privacidad (`/privacidad`)
- Cookies (`/cookies`)

## Tecnologías

- Nuxt 4, Vue 3, Vite
- Estilos: CSS

## Requisitos

- Node.js >= 18.20
- pnpm

## Puesta en marcha

Instalar dependencias:

```bash
# pnpm
pnpm install

# npm
npm install
```


```bash
# pnpm
pnpm dev

# npm
npm run dev
```


## Estructura del proyecto

- `app/`
  - `pages/`: páginas del sitio (rutas)
  - `components/`: componentes compartidos
  - `app.config.ts`: metadatos del sitio (nombre, URLs, navegación, redes)
- `server/api/`
  - `data.get.ts`: API para obtener datos de eventos más populares
  - `media/sync.get.ts`: sincroniza y cachea medios locales (vídeo/imagen) y datos
  - `media/image/[filename].get.ts`: sirve imágenes
  - `media/video/[filename].get.ts`: sirve vídeo 
- `storage/cache/instagram/`: caché local de datos y medios
  - `data/`: instantáneas JSON
  - `images/`: miniaturas
  - `videos/`: ficheros de vídeo
- `public/`: assets estáticos públicos
- `nuxt.config.ts`: configuración