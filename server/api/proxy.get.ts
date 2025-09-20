import { defineEventHandler, getQuery, createError, setResponseHeaders, sendStream } from 'h3'
import { Readable } from 'node:stream'

const ALLOWED_HOST_PATTERNS: RegExp[] = [
  /^scontent-[a-zA-Z0-9-]+\.fbcdn\.net$/i,
  /^[a-zA-Z0-9-]+\.fbcdn\.net$/i,
  /^video-[a-zA-Z0-9-]+\.cdninstagram\.com$/i,
  /^video\.cdninstagram\.com$/i,
  /^scontent-[a-zA-Z0-9-]+\.cdninstagram\.com$/i,
  /^scontent\.cdninstagram\.com$/i,
]

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOST_PATTERNS.some((re) => re.test(hostname))
}

export default defineEventHandler(async (event) => {
  const method = (event.node.req.method || 'GET').toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  const q = getQuery(event)
  const rawUrl = typeof q.url === 'string' ? q.url : ''
  if (!rawUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url' })
  }

  let target: URL
  try {
    target = new URL(rawUrl)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid url' })
  }

  if (target.protocol !== 'https:') {
    throw createError({ statusCode: 400, statusMessage: 'Only https is allowed' })
  }

  if (!isAllowedHost(target.hostname)) {
    throw createError({ statusCode: 403, statusMessage: 'Host not allowed' })
  }

  const headers: Record<string, string> = {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    accept: '*/*',
    referer: 'https://www.instagram.com/',
    'accept-language': 'en-US,en;q=0.9',
  }

  const range = event.node.req.headers['range']
  if (typeof range === 'string') headers['range'] = range

  let res: Response
  try {
    res = await fetch(target.toString(), { method, headers })
  } catch (err) {
    throw createError({ statusCode: 502, statusMessage: 'Upstream fetch failed' })
  }

  // Accept 200 OK or 206 Partial Content for ranged requests
  if (!res.ok && res.status !== 206) {
    throw createError({ statusCode: res.status || 502, statusMessage: `Upstream error ${res.status}` })
  }

  const contentType = (res.headers.get('content-type') || '').toLowerCase()
  const isAllowedType = contentType.startsWith('video/') || contentType.startsWith('image/')
  if (!isAllowedType) {
    throw createError({ statusCode: 415, statusMessage: 'Unsupported media type' })
  }

  // Pass-through critical headers for streaming and caching
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
  if (!pass['Cache-Control']) {
    // Reasonable default; adjust as needed
    pass['Cache-Control'] = 'public, max-age=3600'
  }

  setResponseHeaders(event, pass)
  event.node.res.statusCode = res.status

  // HEAD requests should not include a body
  if (method === 'HEAD' || !res.body) {
    return null
  }

  // Stream response body to client
  const nodeStream = Readable.fromWeb(res.body as any)
  return sendStream(event, nodeStream)
})
