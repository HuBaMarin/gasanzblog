// server/api/instagram/sync.get.ts
import { defineEventHandler, createError, getQuery } from 'h3'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import crypto from 'node:crypto'
import { put } from '@vercel/blob'

function getBaseDir() {
  const envDir = process.env.MEDIA_CACHE_DIR
  if (envDir && envDir.trim()) return envDir
  if (process.env.VERCEL) return '/tmp/instagram'
  return join(process.cwd(), 'storage/cache/instagram')
}

const BASE_DIR = getBaseDir()
const VIDEOS_DIR = join(BASE_DIR, 'videos')
const IMAGES_DIR = join(BASE_DIR, 'images')
const DATA_DIR = join(BASE_DIR, 'data')

// Some Instagram CDNs reject requests without a "browser-like" UA + referer
const IG_FETCH_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  accept: '*/*',
  referer: 'https://www.instagram.com/',
  'accept-language': 'en-US,en;q=0.9',
}

function urlExt(url: string): string {
  try {
    const u = new URL(url)
    const e = extname(u.pathname).toLowerCase()
    // guard against absurd ext lengths (e.g. path tricks)
    return e && e.length <= 5 ? e : ''
  } catch {
    return ''
  }
}

function fallbackVideoExt(ct: string | null): string {
  if (!ct) return '.mp4'
  if (ct.includes('webm')) return '.webm'
  if (ct.includes('quicktime') || ct.includes('mov')) return '.mov'
  return '.mp4'
}

function fallbackImageExt(ct: string | null): string {
  if (!ct) return '.jpg'
  if (ct.includes('webp')) return '.webp'
  if (ct.includes('png')) return '.png'
  if (ct.includes('jpeg') || ct.includes('jpg')) return '.jpg'
  return '.jpg'
}

async function ensureDirs() {
  for (const dir of [BASE_DIR, VIDEOS_DIR, IMAGES_DIR, DATA_DIR]) {
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  }
}

function safeBaseId(item: any): string {
  const base =
    item?.id ||
    item?.shortcode ||
    item?.url ||
    item?.videoUrl ||
    item?.displayUrl ||
    String(Math.random())
  return crypto.createHash('md5').update(String(base)).digest('hex').slice(0, 12)
}

export default defineEventHandler(async (event) => {
  try {
    await ensureDirs()

    // 1) Fetch dataset items
    const items = await $fetch<any[]>(
      'https://api.apify.com/v2/datasets/xACE0vd7QjtiPPOIB/items?format=json&clean=true'
    )

    // Optional limit
    const q = getQuery(event)
    const limit = Math.max(0, Math.min(200, Number(q.limit || 0)))
    const working = limit > 0 ? items.slice(0, limit) : items

    const processedItems: any[] = []

    // 2) Process each item
    for (const raw of working) {
      const item = { ...raw }
      const baseId = safeBaseId(item)

      // VIDEO
      if (item.videoUrl) {
        try {
          // Prefer URL ext if present, otherwise decide after fetch via content-type
          let ext = urlExt(item.videoUrl) || '.mp4'
          let filename = `${baseId}_video${ext}`
          let fullPath = join(VIDEOS_DIR, filename)

          if (!existsSync(fullPath)) {
            const res = await fetch(item.videoUrl, { headers: IG_FETCH_HEADERS })
            if (!res.ok) throw new Error(`Video HTTP ${res.status}`)

            // Adjust extension if URL had no extension
            if (!urlExt(item.videoUrl)) {
              const ct = res.headers.get('content-type')
              ext = fallbackVideoExt(ct)
              filename = `${baseId}_video${ext}`
              fullPath = join(VIDEOS_DIR, filename)
            }

            const ab = await res.arrayBuffer()
            const buf = Buffer.from(ab)

            const USE_BLOB = Boolean(process.env.VERCEL) || Boolean(process.env.BLOB_READ_WRITE_TOKEN)
            if (USE_BLOB) {
              const key = `instagram/videos/${filename}`
              const uploaded = await put(key, buf, {
                access: 'public',
                contentType: videoMimeFromExt(ext),
                token: process.env.BLOB_READ_WRITE_TOKEN,
              })
              item.localVideoUrl = uploaded.url
            } else {
              await writeFile(fullPath, buf)
              item.localVideoUrl = `/api/media/video/${filename}`
            }
          }
          if (!item.localVideoUrl) {
            // If file existed and we didn't upload just now, fallback to local API path
            item.localVideoUrl = `/api/media/video/${filename}`
          }
        } catch (err) {
          console.error(`Failed to download video for item ${item.id || baseId}:`, err)
        }
      }

      // IMAGE/THUMBNAIL
      if (item.displayUrl) {
        try {
          let ext = urlExt(item.displayUrl) || '.jpg'
          let filename = `${baseId}_thumb${ext}`
          let fullPath = join(IMAGES_DIR, filename)

          if (!existsSync(fullPath)) {
            const res = await fetch(item.displayUrl, { headers: IG_FETCH_HEADERS })
            if (!res.ok) throw new Error(`Image HTTP ${res.status}`)

            if (!urlExt(item.displayUrl)) {
              const ct = res.headers.get('content-type')
              ext = fallbackImageExt(ct)
              filename = `${baseId}_thumb${ext}`
              fullPath = join(IMAGES_DIR, filename)
            }

            const ab = await res.arrayBuffer()
            const buf = Buffer.from(ab)
            const USE_BLOB = Boolean(process.env.VERCEL) || Boolean(process.env.BLOB_READ_WRITE_TOKEN)
            if (USE_BLOB) {
              const key = `instagram/images/${filename}`
              const uploaded = await put(key, buf, {
                access: 'public',
                contentType: imageMimeFromExt(ext),
                token: process.env.BLOB_READ_WRITE_TOKEN,
              })
              item.localDisplayUrl = uploaded.url
            } else {
              await writeFile(fullPath, buf)
              item.localDisplayUrl = `/api/media/image/${filename}`
            }
          }
          if (!item.localDisplayUrl) {
            item.localDisplayUrl = `/api/media/image/${filename}`
          }
        } catch (err) {
          console.error(`Failed to download image for item ${item.id || baseId}:`, err)
        }
      }

      processedItems.push(item)
    }

    // 3) Save data snapshot
    const dataJson = JSON.stringify(processedItems, null, 2)
    const dataFilename = `data_${Date.now()}.json`
    await writeFile(join(DATA_DIR, dataFilename), dataJson)
    await writeFile(join(DATA_DIR, 'latest.json'), dataJson)

    // Also publish latest.json to Vercel Blob if available for cross-instance access
    try {
      const USE_BLOB = Boolean(process.env.VERCEL) || Boolean(process.env.BLOB_READ_WRITE_TOKEN)
      if (USE_BLOB) {
        await put('instagram/data/latest.json', dataJson, {
          access: 'public',
          contentType: 'application/json',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })
      }
    } catch (e) {
      console.warn('Failed to upload latest.json to Blob:', e)
    }

    return {
      success: true,
      message: 'Media synchronized successfully',
      itemsProcessed: processedItems.length,
      dataFile: dataFilename,
    }
  } catch (error) {
    console.error('Sync error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Failed to sync media' })
  }
})