import { defineEventHandler, sendRedirect } from 'h3'

export default defineEventHandler((event) => {
  return sendRedirect(event, '/eventos', 301)
})
