export default defineEventHandler(event => {
 if (/^\/(?:en\/)?(?:api\/)?portal(?:\/|$)/.test(getRequestURL(event).pathname)) {
  setHeader(event,'Cache-Control','private, no-store')
  setHeader(event,'X-Robots-Tag','noindex, nofollow')
  setHeader(event,'Referrer-Policy','no-referrer')
 }
})
