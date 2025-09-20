import { defineEventHandler, getRouterParam, createError, sendStream, setResponseHeaders } from 'h3'
import { stat } from 'node:fs/promises'
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

const VIDEOS_DIR = join(getBaseDir(), 'videos')

function mimeFromExt(ext: string): string {
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

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename')
  if (!filename) throw createError({ statusCode: 400, statusMessage: 'Missing filename' })

  const filePath = join(VIDEOS_DIR, filename)
  const range = event.node.req.headers.range

  if (!existsSync(filePath)) {
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN
      const ext = extname(filename)
      const base = filename.slice(0, Math.max(0, filename.length - ext.length))
      const prefixes = [
        `instagram/videos/${filename}`,
        `instagram/videos/${base}-`,
        `instagram/videos/${base}`,
      ]

      let blobUrl: string | null = null
      for (const p of prefixes) {
        const res = await list({ prefix: p, token: token || undefined })
        const candidates = (res.blobs || []) as any[]
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

      const headers: Record<string, string> = {
        accept: 'video/mp4,video/*;q=0.9,*/*;q=0.7',
      }
      if (typeof range === 'string' && range.trim() !== '') headers['range'] = range

      const res = await fetch(blobUrl, { headers })
      if (!res.ok && res.status !== 206) {
        throw createError({ statusCode: res.status || 502, statusMessage: `Upstream error ${res.status}` })
      }

      const pass: Record<string, string> = {}
      const headerMap: Record<string, string> = {
        'accept-ranges': 'Accept-Ranges',
        'content-type': 'Content-Type',
        'content-length': 'Content-Length',
        'content-range': 'Content-Range',
        etag: 'ETag',
        'last-modified': 'Last-Modified',
        'cache-control': 'Cache-Control',
      }
      for (const [lower, proper] of Object.entries(headerMap)) {
        const v = res.headers.get(lower)
        if (v) pass[proper] = v
      }
      if (!pass['Cache-Control']) pass['Cache-Control'] = 'public, max-age=31536000, immutable'
      pass['Vary'] = pass['Vary'] ? pass['Vary'] + ', Range' : 'Range'

      if (!pass['Content-Disposition']) pass['Content-Disposition'] = 'inline'
      setResponseHeaders(event, pass)
      event.node.res.statusCode = res.status
      if (event.node.req.method === 'HEAD' || !res.body) return null
      const nodeStream = Readable.fromWeb(res.body as any)
      return sendStream(event, nodeStream)
    } catch (e) {
      throw createError({ statusCode: 404, statusMessage: 'Not found' })
    }
  }

  const fileStat = await stat(filePath)
  const fileSize = fileStat.size
  const ext = extname(filename)
  const contentType = mimeFromExt(ext)

  setResponseHeaders(event, {
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Type': contentType,
    'Content-Disposition': 'inline',
  })

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range)
    if (!match) throw createError({ statusCode: 416, statusMessage: 'Invalid range' })

    const start = match[1] ? parseInt(match[1], 10) : 0
    const end = match[2] ? parseInt(match[2], 10) : fileSize - 1

    if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= fileSize) {
      throw createError({ statusCode: 416, statusMessage: 'Range Not Satisfiable' })
    }

    const chunkSize = end - start + 1
    event.node.res.statusCode = 206
    setResponseHeaders(event, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': String(chunkSize),
    })
    return sendStream(event, createReadStream(filePath, { start, end }))
  } else {
    setResponseHeaders(event, { 'Content-Length': String(fileSize) })
    return sendStream(event, createReadStream(filePath))
  }
})