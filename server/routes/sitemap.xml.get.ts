import { projects } from '../../app/data/projects'
import { expertises } from '../../app/data/expertises'
import { cities } from '../../app/data/cities'
import { offers } from '../../app/data/offers'

export default defineEventHandler((event) => {
  const paths = [
    '/',
    '/projects',
    '/expertises',
    '/a-propos',
    '/contact',
    '/business',
    '/creators',
    '/partners',
    '/offre',
    '/privacy',
    '/terms',
    ...projects.map((project) => `/projects/${project.slug}`),
    ...expertises.map((expertise) => `/expertises/${expertise.slug}`),
    ...offers.map((offer) => `/services/${offer.slug}`),
    ...cities.map((city) => `/${city.slug}`),
  ]
  const escapeXml = (value: string) =>
    value.replace(
      /[<>&"']/g,
      (character) =>
        ({
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&apos;',
        })[character]!,
    )
  const urls = [
    ...new Set(
      paths.flatMap((path) => [path, path === '/' ? '/en' : `/en${path}`]),
    ),
  ]
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => `<url><loc>${escapeXml(`https://www.mc-studio.eu${path === '/' ? '' : path}`)}</loc></url>`).join('')}</urlset>`
})
