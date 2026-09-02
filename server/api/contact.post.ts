interface ContactPayload {
  audience?: unknown
  name?: unknown
  email?: unknown
  phone?: unknown
  company?: unknown
  projectType?: unknown
  message?: unknown
  website?: unknown
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT_WINDOW = 60 * 60 * 1000
const RATE_LIMIT_MAX = 5
const attempts = new Map<string, { count: number; resetAt: number }>()

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#039;',
        '"': '&quot;'
      })[character] || character
  )

const checkRateLimit = (key: string) => {
  const now = Date.now()
  const current = attempts.get(key)

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (current.count >= RATE_LIMIT_MAX) return false

  current.count += 1
  return true
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactPayload>(event)

  // Bots commonly fill fields hidden from real visitors. Return a neutral success
  // so the endpoint does not reveal the anti-spam rule.
  if (cleanText(body.website, 200)) {
    return { ok: true }
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (!checkRateLimit(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many contact requests'
    })
  }

  const name = cleanText(body.name, 100)
  const audience = cleanText(body.audience, 20)
  const email = cleanText(body.email, 160).toLowerCase()
  const phone = cleanText(body.phone, 40)
  const company = cleanText(body.company, 120)
  const projectType = cleanText(body.projectType, 80)
  const message = cleanText(body.message, 4000)

  if (!['business', 'creator'].includes(audience) || name.length < 2 || !EMAIL_PATTERN.test(email) || message.length < 20) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid contact form'
    })
  }

  const config = useRuntimeConfig(event)
  const resendApiKey = String(config.resendApiKey || '')
  const contactFrom = String(
    config.contactFrom || 'MC Studio <contact@mc-studio.eu>'
  )
  const contactTo = String(config.contactTo || 'contact@mc-studio.eu')

  if (!resendApiKey) {
    console.error('Resend API key is not configured')
    throw createError({
      statusCode: 503,
      statusMessage: 'Contact service unavailable'
    })
  }

  const safe = {
    audience: escapeHtml(audience === 'creator' ? 'Créateur' : 'Entreprise'),
    name: escapeHtml(name),
    email: escapeHtml(email),
    phone: escapeHtml(phone || 'Non renseigné'),
    company: escapeHtml(company || 'Non renseignée'),
    projectType: escapeHtml(projectType || 'Non renseigné'),
    message: escapeHtml(message).replace(/\n/g, '<br>')
  }

  try {
    await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        from: contactFrom,
        to: [contactTo],
        reply_to: email,
        subject: `Nouveau projet — ${name}`,
        text: [
          `Profil : ${audience === 'creator' ? 'Créateur' : 'Entreprise'}`,
          `Nom : ${name}`,
          `Email : ${email}`,
          `Téléphone : ${phone || 'Non renseigné'}`,
          `Entreprise : ${company || 'Non renseignée'}`,
          `Type de projet : ${projectType || 'Non renseigné'}`,
          '',
          'Message :',
          message
        ].join('\n'),
        html: `
          <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#171717;line-height:1.6">
            <div style="background:#111;padding:24px 28px;border-radius:16px 16px 0 0">
              <p style="margin:0;color:#f0bf6c;font-size:12px;text-transform:uppercase;letter-spacing:1.4px">MC Studio</p>
              <h1 style="margin:8px 0 0;color:#fff;font-size:24px">Nouvelle demande de contact</h1>
            </div>
            <div style="border:1px solid #e7e7e7;border-top:0;padding:28px;border-radius:0 0 16px 16px">
              <p><strong>Profil :</strong> ${safe.audience}</p>
              <p><strong>Nom :</strong> ${safe.name}</p>
              <p><strong>Email :</strong> <a href="mailto:${safe.email}">${safe.email}</a></p>
              <p><strong>Téléphone :</strong> ${safe.phone}</p>
              <p><strong>Entreprise :</strong> ${safe.company}</p>
              <p><strong>Type de projet :</strong> ${safe.projectType}</p>
              <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e7e7e7">
                <strong>Message</strong>
                <p style="white-space:normal">${safe.message}</p>
              </div>
            </div>
          </div>
        `
      }
    })
  } catch {
    console.error('Resend delivery failed')
    throw createError({
      statusCode: 502,
      statusMessage: 'Contact message delivery failed'
    })
  }

  return { ok: true }
})
