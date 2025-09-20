// server/api/media/image/[filename].get.ts
import { defineEventHandler, getRouterParam, createError, sendStream, setResponseHeaders } from 'h3'
import { createReadStream, existsSync } from 'node:fs'
import { join, extname } from 'node:path'

const IMAGES_DIR = join(process.cwd(), 'storage/cache/instagram/images')

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
  if (!existsSync(filePath)) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const contentType = mimeFromExt(extname(filename))
  setResponseHeaders(event, {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Type': contentType,
  })

  return sendStream(event, createReadStream(filePath))
})