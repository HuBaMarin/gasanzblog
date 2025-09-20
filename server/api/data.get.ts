import { defineEventHandler, getQuery, setResponseHeaders } from 'h3'
import { list } from '@vercel/blob'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import crypto from 'node:crypto'

function getBaseDir() {
  const envDir = process.env.MEDIA_CACHE_DIR
  if (envDir && envDir.trim()) return envDir
  if (process.env.VERCEL) return '/tmp/instagram'
  return join(process.cwd(), 'storage/cache/instagram')
}

const BASE_DIR = getBaseDir()
const LATEST_PATH = join(BASE_DIR, 'data/latest.json')
const VIDEOS_DIR = join(BASE_DIR, 'videos')
const IMAGES_DIR = join(BASE_DIR, 'images')

function safeBaseId(item: any): string {
  const base = item?.id || item?.shortcode || item?.url || item?.videoUrl || item?.displayUrl || String(Math.random())
  return crypto.createHash('md5').update(String(base)).digest('hex').slice(0, 12)
}

function withLocalPaths(items: any[]): any[] {
  const videoExts = ['.mp4', '.webm', '.mov']
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp']
  return items.map((it) => {
    const item = { ...it }
    const baseId = safeBaseId(item)

    // Only set local paths if not already present
    if (!item.localVideoUrl) {
      for (const ext of videoExts) {
        const fname = `${baseId}_video${ext}`
        const fpath = join(VIDEOS_DIR, fname)
        if (existsSync(fpath)) {
          item.localVideoUrl = `/api/media/video/${fname}`
          break
        }
      }
    }

    if (!item.localDisplayUrl) {
      for (const ext of imageExts) {
        const fname = `${baseId}_thumb${ext}`
        const fpath = join(IMAGES_DIR, fname)
        if (existsSync(fpath)) {
          item.localDisplayUrl = `/api/media/image/${fname}`
          break
        }
      }
    }

    return item
  })
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const limit = Math.max(1, Math.min(200, Number(q.limit || 30)))

  // Helper to sort + slice
  const toResponse = (items: any[]) => {
    const sorted = [...items].sort((a: any, b: any) => (b.likesCount || 0) - (a.likesCount || 0))
    const mostLiked = sorted.slice(0, limit)
    return mostLiked
  }

  // If local cache not present, try Vercel Blob first, then fallback to remote dataset
  if (!existsSync(LATEST_PATH)) {
    try {
      // Check Blob store for latest.json
      const token = process.env.BLOB_READ_WRITE_TOKEN
      const blobs = await list({ prefix: 'instagram/data/latest.json', token: token || undefined })
      const blob = blobs.blobs?.[0]
      if (blob?.url) {
        const items = await $fetch<any[]>(blob.url, { headers: { accept: 'application/json' } })
        setResponseHeaders(event, { 'Cache-Control': 'public, max-age=300' })
        return { success: true, mostLiked: toResponse(withLocalPaths(items)), cached: true }
      }
    } catch (e) {
      // ignore and fallback below
    }

    try {
      const DATASET_URL = `https://api.apify.com/v2/datasets/EQ72boqcTz81HGI9Y/items?format=json&clean=true`
      const items = await $fetch<any[]>(DATASET_URL)
      setResponseHeaders(event, { 'Cache-Control': 'public, max-age=300' })
      return { success: true, mostLiked: toResponse(withLocalPaths(items)), cached: false }
    } catch {
      setResponseHeaders(event, { 'Cache-Control': 'public, max-age=60' })
      return { success: true, mostLiked: [], cached: false }
    }
  }

  const raw = await readFile(LATEST_PATH, 'utf-8')
  const items = JSON.parse(raw)
  setResponseHeaders(event, { 'Cache-Control': 'public, max-age=120' })
  return { success: true, mostLiked: toResponse(withLocalPaths(items)), cached: true }
})