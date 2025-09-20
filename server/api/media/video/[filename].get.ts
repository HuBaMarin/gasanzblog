import { defineEventHandler, getRouterParam, createError, sendStream, setResponseHeaders } from 'h3'
import { stat } from 'node:fs/promises'
import { createReadStream, existsSync } from 'node:fs'
import { join, extname } from 'node:path'

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
  if (!existsSync(filePath)) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const fileStat = await stat(filePath)
  const fileSize = fileStat.size
  const ext = extname(filename)
  const contentType = mimeFromExt(ext)

  setResponseHeaders(event, {
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Type': contentType,
  })

  const range = event.node.req.headers.range
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