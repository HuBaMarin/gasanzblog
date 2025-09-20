// server/api/data.get.ts
import { defineEventHandler, getQuery } from 'h3'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const LATEST_PATH = join(process.cwd(), 'storage/cache/instagram/data/latest.json')

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const limit = Math.max(1, Math.min(200, Number(q.limit || 30)))

  if (!existsSync(LATEST_PATH)) {
    return { success: true, mostLiked: [], cached: false }
  }

  const raw = await readFile(LATEST_PATH, 'utf-8')
  const items = JSON.parse(raw)

  // Example: sort by likesCount desc and limit
  const sorted = [...items].sort((a: any, b: any) => (b.likesCount || 0) - (a.likesCount || 0))
  const mostLiked = sorted.slice(0, limit)

  return { success: true, mostLiked, cached: true }
})