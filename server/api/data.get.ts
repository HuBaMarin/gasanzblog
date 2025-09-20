import { defineEventHandler, getQuery, setResponseHeaders } from 'h3'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const LATEST_PATH = join(process.cwd(), 'storage/cache/instagram/data/latest.json')

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const limit = Math.max(1, Math.min(200, Number(q.limit || 30)))

  // Helper to sort + slice
  const toResponse = (items: any[]) => {
    const sorted = [...items].sort((a: any, b: any) => (b.likesCount || 0) - (a.likesCount || 0))
    const mostLiked = sorted.slice(0, limit)
    return mostLiked
  }

  // If local cache not present, fallback to remote dataset (safe, read-only)
  if (!existsSync(LATEST_PATH)) {
    try {
      const items = await $fetch<any[]>(
        'https://api.apify.com/v2/datasets/xACE0vd7QjtiPPOIB/items?format=json&clean=true'
      )
      setResponseHeaders(event, { 'Cache-Control': 'public, max-age=300' })
      return { success: true, mostLiked: toResponse(items), cached: false }
    } catch {
      setResponseHeaders(event, { 'Cache-Control': 'public, max-age=60' })
      return { success: true, mostLiked: [], cached: false }
    }
  }

  const raw = await readFile(LATEST_PATH, 'utf-8')
  const items = JSON.parse(raw)
  setResponseHeaders(event, { 'Cache-Control': 'public, max-age=120' })
  return { success: true, mostLiked: toResponse(items), cached: true }
})