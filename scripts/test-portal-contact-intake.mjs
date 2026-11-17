import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const directory = mkdtempSync(join(tmpdir(), 'mc-intake-test-'))
process.env.DATABASE_URL = ''
process.env.NUXT_DATABASE_URL = ''
process.env.NODE_ENV = 'development'
process.env.NUXT_PORTAL_DB_PATH = join(directory, 'test.sqlite')
const { capturePortalContact } = await import('../server/utils/portal-contact-intake.ts')
const { portalDb } = await import('../server/utils/portal-db.ts')
const db = await portalDb()
try {
  const input = { name: 'Client de test', email: 'client@example.test', company: 'Test', phone: '',
    audience: 'business', social: '', projectType: 'Application', message: "Une application pour l’équipe." }
  const submissions = await Promise.all([capturePortalContact(input), capturePortalContact(input)])
  assert.equal(submissions.filter(row => row.duplicate).length, 1)
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM portal_crm_opportunities').get()).n, 1)
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM users').get()).n, 0)
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM invitations').get()).n, 0)
  assert.equal((await db.prepare('SELECT message FROM portal_contact_submissions').get()).message, input.message)
  await capturePortalContact({ ...input, message: 'Une deuxième demande distincte à conserver.' })
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM portal_crm_contacts').get()).n, 1)
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM portal_crm_opportunities').get()).n, 2)
  const contact = await db.prepare('SELECT * FROM portal_crm_contacts').get()
  await capturePortalContact({ ...input, name: 'Nom public différent', message: 'Troisième demande : ne pas écraser la fiche commerciale.' })
  assert.equal((await db.prepare('SELECT name FROM portal_crm_contacts WHERE id=?').get(contact.id)).name, contact.name)
  const history = await db.prepare('SELECT snapshot FROM portal_crm_opportunity_history ORDER BY created_at').all()
  assert.equal(history.length, 3)
  assert.equal(JSON.parse(history[0].snapshot).message, input.message)
  await db.prepare('UPDATE portal_crm_contacts SET archived_at=? WHERE id=?').run(new Date().toISOString(), contact.id)
  await capturePortalContact({ ...input, message: 'Reprise du contact après archivage de son ancienne fiche.' })
  const replacement = await db.prepare('SELECT * FROM portal_crm_contacts WHERE archived_at IS NULL').get()
  assert.notEqual(replacement.id, contact.id)
  await db.prepare('UPDATE portal_crm_contacts SET email=? WHERE id=?').run('corrected@example.test', replacement.id)
  await capturePortalContact({ ...input, message: 'Nouveau message à l’ancienne adresse après une correction CRM.' })
  const restored = await db.prepare('SELECT * FROM portal_crm_contacts WHERE email=? AND archived_at IS NULL').get(input.email)
  assert.notEqual(restored.id, replacement.id)
  assert.equal(restored.name, input.name)
  console.log('PASS replay-safe public capture, separate requests, no access creation, contact preservation and original message')
} finally {
  await db.close()
  rmSync(directory, { recursive: true, force: true })
}
