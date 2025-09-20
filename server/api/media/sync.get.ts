// server/api/instagram/sync.get.ts
import { defineEventHandler, createError, getQuery } from 'h3'
import { mkdir, writeFile, unlink, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import crypto from 'node:crypto'
import { put } from '@vercel/blob'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

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
const TMP_DIR = join(BASE_DIR, 'tmp')

const _require = createRequire(import.meta.url)

function getFfmpegPath(): string {
  // Allow explicit override
  const envPath = process.env.FFMPEG_PATH
  if (envPath && envPath.trim()) return envPath

  // On Vercel, the ffmpeg-static binary is typically stripped due to size limits.
  // Avoid importing it to prevent runtime crashes when the file is missing.
  if (process.env.VERCEL) return 'ffmpeg'

  try {
    const mod = _require('ffmpeg-static') as unknown
    const bin = (mod as any)?.default ?? mod
    if (typeof bin === 'string' && bin) return bin
  } catch {
    // ignore and fall back
  }
  return 'ffmpeg'
}

function useBlobStorage(): boolean {
  // Prefer LOCAL by default. Set MEDIA_STORAGE=blob to upload to Vercel Blob.
  return String(process.env.MEDIA_STORAGE || '').toLowerCase() === 'blob'
}

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

function videoMimeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case '.mp4':
      return 'video/mp4'
    case '.webm':
      return 'video/webm'
    case '.mov':
      return 'video/quicktime'
    default:
      return 'application/octet-stream'
  }
}

function imageMimeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

async function ensureDirs() {
  for (const dir of [BASE_DIR, VIDEOS_DIR, IMAGES_DIR, DATA_DIR, TMP_DIR]) {
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  }
}

async function compressToMp4(inputPath: string, outputPath: string): Promise<void> {
  const bin = getFfmpegPath()
  const args = [
    '-y',
    '-hide_banner',
    '-i', inputPath,
    '-vf', 'scale=min(1280,iw):-2:flags=lanczos',
    '-movflags', '+faststart',
    '-vcodec', 'libx264',
    '-preset', 'veryfast',
    '-crf', '28',
    '-pix_fmt', 'yuv420p',
    '-acodec', 'aac',
    '-b:a', '128k',
    outputPath,
  ]

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stderr = ''
    proc.stderr.on('data', (d) => { stderr += d?.toString?.() || '' })
    proc.on('error', (err) => reject(err))
    proc.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(0, 2000)}`))
    })
  })
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

    const DATASET_URL = `https://api.apify.com/v2/datasets/EQ72boqcTz81HGI9Y/items?format=json&clean=true`
    const items = await $fetch<any[]>(DATASET_URL)

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
          // Determine input extension for temp file
          let inExt = urlExt(item.videoUrl) || '.mp4'
          const outExt = '.mp4'
          let filename = `${baseId}_video${outExt}`
          let fullOutPath = join(VIDEOS_DIR, filename)

          if (!existsSync(fullOutPath)) {
            const res = await fetch(item.videoUrl, { headers: IG_FETCH_HEADERS })
            if (!res.ok) throw new Error(`Video HTTP ${res.status}`)

            // Adjust temp input extension based on content-type if URL had no extension
            if (!urlExt(item.videoUrl)) {
              const ct = res.headers.get('content-type')
              inExt = fallbackVideoExt(ct)
            }

            const ab = await res.arrayBuffer()
            const buf = Buffer.from(ab)

            // Write temp input file
            const tmpInput = join(TMP_DIR, `${baseId}_src${inExt}`)
            await writeFile(tmpInput, buf)

            // Try to compress to mp4
            let producedPath = fullOutPath
            try {
              await compressToMp4(tmpInput, fullOutPath)
            } catch (e) {
              console.warn(`ffmpeg compression failed for ${baseId}, falling back to original:`, e)
              // Fallback: save original with its own extension
              filename = `${baseId}_video${inExt}`
              producedPath = join(VIDEOS_DIR, filename)
              await writeFile(producedPath, buf)
            } finally {
              // Cleanup temp input
              try { await unlink(tmpInput) } catch {}
            }

            if (useBlobStorage()) {
              const key = `instagram/videos/${filename}`
              const outBuf = await readFile(producedPath)
              await put(key, outBuf, {
                access: 'public',
                contentType: videoMimeFromExt(extname(filename)),
                token: process.env.BLOB_READ_WRITE_TOKEN,
                addRandomSuffix: false,
              })
            }
            // Always prefer local API path (served by our domain)
            item.localVideoUrl = `/api/media/video/${filename}`
          }
          if (!item.localVideoUrl) {
            // If file existed and we didn't upload just now, fallback to local API path
            item.localVideoUrl = `/api/media/video/${filename}`
          }
        } catch (err) {
          console.error(`Failed to download video for item ${item.id || baseId}:`, err)
        }
      }

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
            if (useBlobStorage()) {
              const key = `instagram/images/${filename}`
              await put(key, buf, {
                access: 'public',
                contentType: imageMimeFromExt(ext),
                token: process.env.BLOB_READ_WRITE_TOKEN,
                addRandomSuffix: false,
              })
            } else {
              await writeFile(fullPath, buf)
            }
            // Always prefer local API path
            item.localDisplayUrl = `/api/media/image/${filename}`
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

    const dataJson = JSON.stringify(processedItems, null, 2)
    const dataFilename = `data_${Date.now()}.json`
    await writeFile(join(DATA_DIR, dataFilename), dataJson)
    await writeFile(join(DATA_DIR, 'latest.json'), dataJson)

    try {
      const USE_BLOB = Boolean(process.env.VERCEL) || Boolean(process.env.BLOB_READ_WRITE_TOKEN)
      if (USE_BLOB) {
        await put('instagram/data/latest.json', dataJson, {
          access: 'public',
          contentType: 'application/json',
          token: process.env.BLOB_READ_WRITE_TOKEN,
          addRandomSuffix: false,
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