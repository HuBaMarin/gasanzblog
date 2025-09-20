import { defineEventHandler, getRouterParam, createError, sendStream, setResponseHeaders } from 'h3'
import { createReadStream, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { list } from '@vercel/blob'
import { Readable } from 'node:stream'

function getBaseDir() {
  const envDir = process.env.MEDIA_CACHE_DIR
  if (envDir && envDir.trim()) return envDir
  if (process.env.VERCEL) return '/tmp/instagram'
  return join(process.cwd(), 'storage/cache/instagram')
}

const IMAGES_DIR = join(getBaseDir(), 'images')

function mimeFromExt(ext: string): string {
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

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename')
  if (!filename) throw createError({ statusCode: 400, statusMessage: 'Missing filename' })

  const filePath = join(IMAGES_DIR, filename)
  if (!existsSync(filePath)) {
    // Fallback to Blob (support versioned filenames with hashed suffixes)
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN
      const ext = extname(filename)
      const base = filename.slice(0, Math.max(0, filename.length - ext.length))
      const prefixes = [
        `instagram/images/${filename}`,
        `instagram/images/${base}-`,
        `instagram/images/${base}`,
      ]

      let blobUrl: string | null = null
      for (const p of prefixes) {
        const resList = await list({ prefix: p, token: token || undefined })
        const candidates = (resList.blobs || []) as any[]
        if (candidates.length) {
          const chosen =
            candidates.find((b) => {
              const u: string | undefined = (b as any).url
              const pn: string | undefined = (b as any).pathname
              return (u && u.toLowerCase().endsWith(ext.toLowerCase())) || (pn && pn.toLowerCase().endsWith(ext.toLowerCase()))
            }) || candidates[0]
          blobUrl = (chosen as any).url
          break
        }
      }
      if (!blobUrl) throw new Error('Blob not found')

      const res = await fetch(blobUrl, { headers: { accept: 'image/*;q=0.9,*/*;q=0.7' } })
      if (!res.ok) throw createError({ statusCode: res.status || 502, statusMessage: `Upstream error ${res.status}` })

      const pass: Record<string, string> = {}
      const headerMap: Record<string, string> = {
        'content-type': 'Content-Type',
        'content-length': 'Content-Length',
        etag: 'ETag',
        'last-modified': 'Last-Modified',
        'cache-control': 'Cache-Control',
      }
      for (const [lower, proper] of Object.entries(headerMap)) {
        const v = res.headers.get(lower)
        if (v) pass[proper] = v
      }
      if (!pass['Cache-Control']) pass['Cache-Control'] = 'public, max-age=31536000, immutable'
      if (!pass['Content-Disposition']) pass['Content-Disposition'] = 'inline'

      setResponseHeaders(event, pass)
      if (event.node.req.method === 'HEAD' || !res.body) return null
      const nodeStream = Readable.fromWeb(res.body as any)
      return sendStream(event, nodeStream)
    } catch (e) {
      throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }
  }

  const contentType = mimeFromExt(extname(filename))
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Type': contentType,
    'Content-Disposition': 'inline',
  })

  return sendStream(event, createReadStream(filePath))
})