import { createHash, randomUUID } from 'node:crypto'
import { portalDb } from './portal-db.ts'

export interface PortalContactSubmission {
  name: string
  email: string
  company: string
  phone: string
  audience: string
  social: string
  projectType: string
  message: string
}

// Public submissions can create a lead, never a portal account or an invitation.
export async function capturePortalContact(input: PortalContactSubmission) {
  const db = await portalDb()
  const now = new Date().toISOString()
  const key = createHash('sha256').update(JSON.stringify([input, now.slice(0, 10)])).digest('hex')
  return db.transaction(async () => {
    const inserted = await db.prepare(`INSERT INTO portal_contact_submissions(id,created_at)
      VALUES(?,?) ON CONFLICT(id) DO NOTHING`).run(key, now)
    if (!inserted.changes) return { id: key, duplicate: true }
    // Serialize public captures by address without imposing uniqueness on the
    // CRM (shared mailboxes are legitimate). SQLite already serializes writes.
    if (db.dialect === 'postgres') {
      await db.prepare('SELECT pg_advisory_xact_lock(hashtext(?))').get(`portal-intake:${input.email}`)
    }
    const existing = await db.prepare(`SELECT id FROM portal_crm_contacts
      WHERE email=? AND email<>'' AND archived_at IS NULL ORDER BY created_at,id LIMIT 1`).get(input.email)
    const contactId = existing?.id || randomUUID()
    if (!existing) {
      await db.prepare(`INSERT INTO portal_crm_contacts(id,name,company,email,phone,role,notes,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?)`).run(
        contactId, input.name, input.company, input.email, input.phone, '',
        'Contact reçu depuis le formulaire public MC Studio.', now, now)
    }
    const opportunityId = randomUUID()
    const title = (input.projectType || `Projet de ${input.company || input.name}`).slice(0, 160)
    const source = 'Formulaire du site'
    const nextAction = `Répondre à ${input.name} et qualifier la demande.`
    await db.prepare(`INSERT INTO portal_crm_opportunities
      (id,contact_id,title,source,amount_cents,stage,next_action,created_at,updated_at)
      VALUES(?,?,?,?,0,'new',?,?,?)`).run(opportunityId, contactId, title, source, nextAction, now, now)
    await db.prepare(`INSERT INTO portal_crm_opportunity_history
      (id,opportunity_id,kind,snapshot,author_id,created_at) VALUES(?,?,'created',?,NULL,?)`).run(
      randomUUID(), opportunityId,
      JSON.stringify({ title, source, stage: 'new', amountCents: 0, nextAction, updatedAt: now,
        message: input.message, audience: input.audience, social: input.social }), now)
    await db.prepare(`UPDATE portal_contact_submissions SET contact_id=?,opportunity_id=?,message=? WHERE id=?`)
      .run(contactId, opportunityId, input.message, key)
    return { id: key, duplicate: false }
  })
}
