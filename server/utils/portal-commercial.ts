import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import { roadmapDate } from '../../shared/portal-roadmap.ts'
import type { PortalDatabase } from './portal-db.ts'
import { readProjectTimeHistory } from './portal-project-timer.ts'

type Input = Record<string, unknown>
type EntrySource = 'manual' | 'webhook'
const stages = ['network', 'new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const
type Stage = typeof stages[number]
const maxCents = 2_000_000_000
const localDate = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', dateStyle: 'short' })
const now = () => new Date().toISOString()
const today = () => localDate.format(new Date())

function fail(statusCode: number, message: string): never {
  throw createError({ statusCode, message, data: { message } })
}

function object(value: unknown): Input {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400, 'Données commerciales invalides.')
  return value as Input
}

function field(value: unknown, label: string, max: number, required = false) {
  const result = typeof value === 'string' ? value.trim() : ''
  if ((value != null && typeof value !== 'string') || result.length > max || (required && !result)) {
    fail(400, `Champ invalide · ${label}.`)
  }
  return result
}

function identifier(value: unknown, label = 'identifiant') {
  return field(value, label, 100, true)
}

function optionalId(value: unknown, label: string) {
  return field(value, label, 100) || null
}

function number(value: unknown, label: string, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    fail(400, `Valeur invalide · ${label}.`)
  }
  return value
}

function cents(value: unknown, label: string, min = 0) {
  return number(value, label, min, maxCents)
}

function date(value: unknown, label: string, optional = false) {
  if (optional && (value == null || value === '')) return ''
  const result = roadmapDate(value)
  if (!result) fail(400, `Date invalide · ${label}.`)
  return result
}

function pastDate(value: unknown, label: string) {
  const result = date(value, label)
  if (result > today()) fail(400, `Date future · ${label}.`)
  return result
}

function externalUrl(value: unknown) {
  const result = field(value, 'lien du document', 2000)
  if (!result) return ''
  try {
    const url = new URL(result)
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href
  } catch {}
  return fail(400, 'Le lien du document doit être une URL HTTPS.')
}

function referenceKey(value: string) {
  return value.normalize('NFKC').toUpperCase()
}

async function lockRow(db: PortalDatabase, table: 'projects' | 'portal_crm_opportunities' | 'portal_crm_documents' | 'portal_finance_invoices', id: string) {
  return db.prepare(`SELECT id FROM ${table} WHERE id=?${db.dialect === 'postgres' ? ' FOR UPDATE' : ''}`).get(id)
}

const opportunityColumns = `id,contact_id AS contactId,title,source,amount_cents AS amountCents,probability,stage,
  next_action AS nextAction,next_action_date AS nextActionDate,lost_reason AS lostReason,organization_id AS organizationId,
  project_id AS projectId,converted_at AS convertedAt,created_at AS createdAt,updated_at AS updatedAt`

async function readOpportunity(db: PortalDatabase, id: string) {
  const opportunity = await db.prepare(`SELECT ${opportunityColumns} FROM portal_crm_opportunities WHERE id=?`).get(id)
  if (!opportunity) fail(404, 'Opportunité introuvable.')
  return opportunity
}

async function opportunityHistory(db: PortalDatabase, id: string, kind: 'created' | 'updated' | 'converted', actor: string, timestamp: string) {
  const opportunity = await readOpportunity(db, id)
  await db.prepare('INSERT INTO portal_crm_opportunity_history(id,opportunity_id,kind,snapshot,author_id,created_at) VALUES(?,?,?,?,?,?)')
    .run(randomUUID(), id, kind, JSON.stringify(opportunity), actor, timestamp)
}

export async function saveCommercialContact(db: PortalDatabase, input: Input) {
  const id = optionalId(input.id, 'contact')
  const name = field(input.name, 'nom du contact', 150, true)
  const organizationId = optionalId(input.organizationId, 'organisation')
  const company = field(input.company, 'entreprise', 150)
  const email = field(input.email, 'courriel', 254).toLowerCase()
  const phone = field(input.phone, 'téléphone', 80)
  const role = field(input.role, 'fonction', 120)
  const notes = field(input.notes, 'notes privées', 6000)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Courriel invalide.')
  if (organizationId && !await db.prepare('SELECT id FROM organizations WHERE id=?').get(organizationId)) fail(404, 'Organisation introuvable.')
  const timestamp = now()
  const values = [organizationId, name, company, email, phone, role, notes, timestamp]
  if (id) {
    const result = await db.prepare('UPDATE portal_crm_contacts SET organization_id=?,name=?,company=?,email=?,phone=?,role=?,notes=?,updated_at=? WHERE id=?')
      .run(...values, id)
    if (!result.changes) fail(404, 'Contact introuvable.')
    return { id }
  }
  const newId = randomUUID()
  await db.prepare('INSERT INTO portal_crm_contacts(organization_id,name,company,email,phone,role,notes,updated_at,id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)')
    .run(...values, newId, timestamp)
  return { id: newId }
}

async function archiveContact(db: PortalDatabase, input: Input) {
  const id = identifier(input.id, 'contact')
  if (typeof input.archived !== 'boolean') fail(400, 'État du contact invalide.')
  const timestamp = now()
  const result = await db.prepare('UPDATE portal_crm_contacts SET archived_at=?,updated_at=? WHERE id=?')
    .run(input.archived ? timestamp : null, timestamp, id)
  if (!result.changes) fail(404, 'Contact introuvable.')
  return { id }
}

async function saveOpportunity(db: PortalDatabase, input: Input, actor: string) {
  const id = optionalId(input.id, 'opportunité')
  const title = field(input.title, 'titre de l’opportunité', 160, true)
  const source = field(input.source, 'provenance', 200, true)
  const amount = cents(input.amountCents, 'montant HT')
  const probability = input.probability == null ? null : number(input.probability, 'probabilité', 0, 100)
  const stage = input.stage as Stage
  if (!stages.includes(stage)) fail(400, 'Étape commerciale invalide.')
  const action = field(input.nextAction, 'prochaine action', 500)
  const actionDate = date(input.nextActionDate, 'prochaine action', true)
  if (actionDate && !action) fail(400, 'Renseignez une prochaine action pour la date de relance.')
  const lostReason = field(input.lostReason, 'motif de perte', 500, stage === 'lost')
  const contactId = optionalId(input.contactId, 'contact')

  return db.transaction(async (tx) => {
    if (id && !await lockRow(tx, 'portal_crm_opportunities', id)) fail(404, 'Opportunité introuvable.')
    const existing = id ? await readOpportunity(tx, id) : null
    if (existing?.convertedAt && stage !== 'won') fail(409, 'Une opportunité convertie reste gagnée.')
    if (contactId && contactId !== existing?.contactId) {
      const contact = await tx.prepare('SELECT id FROM portal_crm_contacts WHERE id=? AND archived_at IS NULL').get(contactId)
      if (!contact) fail(400, 'Sélectionnez un contact actif.')
    }
    const opportunityId = id || randomUUID()
    const timestamp = now()
    const values = [contactId, title, source, amount, probability, stage, action, actionDate, stage === 'lost' ? lostReason : '', timestamp]
    if (id) {
      await tx.prepare(`UPDATE portal_crm_opportunities SET contact_id=?,title=?,source=?,amount_cents=?,probability=?,
        stage=?,next_action=?,next_action_date=?,lost_reason=?,updated_at=? WHERE id=?`).run(...values, id)
    } else {
      await tx.prepare(`INSERT INTO portal_crm_opportunities(contact_id,title,source,amount_cents,probability,stage,next_action,next_action_date,
        lost_reason,updated_at,id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run(...values, opportunityId, timestamp)
    }
    await opportunityHistory(tx, opportunityId, id ? 'updated' : 'created', actor, timestamp)
    return { id: opportunityId }
  })
}

async function convertOpportunity(db: PortalDatabase, input: Input, actor: string) {
  const id = identifier(input.id, 'opportunité')
  return db.transaction(async (tx) => {
    if (!await lockRow(tx, 'portal_crm_opportunities', id)) fail(404, 'Opportunité introuvable.')
    const opportunity = await readOpportunity(tx, id)
    if (opportunity.convertedAt) {
      if (!opportunity.projectId || !opportunity.organizationId) fail(409, 'Le projet issu de cette conversion a été supprimé.')
      return { id, organizationId: opportunity.organizationId as string, projectId: opportunity.projectId as string }
    }
    if (opportunity.stage !== 'won') fail(409, 'Passez l’opportunité à Gagnée avant de la convertir.')
    const projectName = field(input.projectName, 'nom du projet', 160, true)
    const description = field(input.description, 'description du projet', 1500)
    const dueDate = date(input.dueDate, 'échéance du projet', true)
    const contact = opportunity.contactId ? await tx.prepare('SELECT organization_id AS organizationId FROM portal_crm_contacts WHERE id=?').get(opportunity.contactId) : null
    let organizationId = input.organizationId === undefined
      ? (contact?.organizationId ?? null) as string | null
      : optionalId(input.organizationId, 'organisation')
    if (organizationId) {
      if (!await tx.prepare('SELECT id FROM organizations WHERE id=?').get(organizationId)) fail(404, 'Organisation introuvable.')
    } else {
      const name = field(input.organizationName, 'nom du client', 120, true)
      organizationId = randomUUID()
      await tx.prepare('INSERT INTO organizations(id,name) VALUES(?,?)').run(organizationId, name)
    }
    const projectId = randomUUID()
    await tx.prepare('INSERT INTO projects(id,organization_id,name,description,due_date) VALUES(?,?,?,?,?)')
      .run(projectId, organizationId, projectName, description, dueDate)
    const timestamp = now()
    if (opportunity.contactId) {
      await tx.prepare('UPDATE portal_crm_contacts SET organization_id=?,updated_at=? WHERE id=? AND organization_id IS NULL')
        .run(organizationId, timestamp, opportunity.contactId)
    }
    await tx.prepare('UPDATE portal_crm_opportunities SET organization_id=?,project_id=?,converted_at=?,updated_at=? WHERE id=?')
      .run(organizationId, projectId, timestamp, timestamp, id)
    await opportunityHistory(tx, id, 'converted', actor, timestamp)
    return { id, organizationId, projectId }
  })
}

async function saveCall(db: PortalDatabase, input: Input, actor: string) {
  const id = optionalId(input.id, 'note d’appel')
  const opportunityId = identifier(input.opportunityId, 'opportunité')
  const occurredOn = pastDate(input.occurredOn, 'date de l’appel')
  const rawNotes = field(input.rawNotes, 'notes originales', 24000)
  const summary = field(input.summary, 'compte rendu', 12000, true)
  const commitments = field(input.commitments, 'engagements', 6000)
  const owners = field(input.owners, 'responsables', 6000)
  const unknowns = field(input.unknowns, 'points à clarifier', 6000)
  const timestamp = now()
  if (id) {
    const result = await db.prepare('UPDATE portal_crm_calls SET occurred_on=?,raw_notes=?,summary=?,commitments=?,owners=?,unknowns=?,updated_at=? WHERE id=? AND opportunity_id=?')
      .run(occurredOn, rawNotes, summary, commitments, owners, unknowns, timestamp, id, opportunityId)
    if (!result.changes) fail(404, 'Note d’appel introuvable.')
    return { id }
  }
  await readOpportunity(db, opportunityId)
  const callId = randomUUID()
  await db.prepare(`INSERT INTO portal_crm_calls(id,opportunity_id,occurred_on,raw_notes,summary,commitments,owners,unknowns,author_id,created_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(callId, opportunityId, occurredOn, rawNotes, summary, commitments, owners, unknowns, actor, timestamp, timestamp)
  return { id: callId }
}

async function saveDocumentVersion(db: PortalDatabase, input: Input, actor: string) {
  const documentId = optionalId(input.documentId, 'document')
  const opportunityId = identifier(input.opportunityId, 'opportunité')
  const kind = input.kind
  if (kind !== 'quote' && kind !== 'contract') fail(400, 'Type de document invalide.')
  const title = field(input.title, 'titre du document', 160, true)
  const scope = field(input.scope, 'périmètre', 10000, true)
  const exclusions = field(input.exclusions, 'exclusions', 10000, true)
  const schedule = field(input.schedule, 'échéancier', 10000, true)
  const amount = cents(input.amountCents, 'montant HT')
  const url = externalUrl(input.externalUrl)

  return db.transaction(async (tx) => {
    await readOpportunity(tx, opportunityId)
    const id = documentId || randomUUID()
    const timestamp = now()
    if (documentId) {
      await lockRow(tx, 'portal_crm_documents', documentId)
      const document = await tx.prepare('SELECT id FROM portal_crm_documents WHERE id=? AND opportunity_id=? AND kind=?')
        .get(documentId, opportunityId, kind)
      if (!document) fail(404, 'Document introuvable pour cette opportunité.')
    } else {
      await tx.prepare('INSERT INTO portal_crm_documents(id,opportunity_id,kind,created_at) VALUES(?,?,?,?)').run(id, opportunityId, kind, timestamp)
    }
    const latest = await tx.prepare('SELECT COALESCE(MAX(version),0) AS version FROM portal_crm_document_versions WHERE document_id=?').get(id)
    const version = Number(latest.version) + 1
    const versionId = randomUUID()
    await tx.prepare(`INSERT INTO portal_crm_document_versions(id,document_id,version,title,scope,exclusions,schedule,amount_cents,external_url,author_id,created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(versionId, id, version, title, scope, exclusions, schedule, amount, url, actor, timestamp)
    return { id, versionId, version }
  })
}

async function recordSignature(db: PortalDatabase, input: Input, actor: string) {
  const id = identifier(input.versionId, 'version du document')
  const signer = field(input.signer, 'nom du signataire', 160, true)
  const signedOn = pastDate(input.signedOn, 'date de la signature')
  const evidence = field(input.evidence, 'référence de la preuve', 3000, true)
  if (!await db.prepare('SELECT id FROM portal_crm_document_versions WHERE id=?').get(id)) fail(404, 'Version introuvable.')
  const result = await db.prepare(`INSERT INTO portal_crm_signatures(version_id,signer,signed_on,evidence,recorded_by,recorded_at)
    VALUES(?,?,?,?,?,?) ON CONFLICT(version_id) DO NOTHING`).run(id, signer, signedOn, evidence, actor, now())
  if (!result.changes) {
    const existing = await db.prepare('SELECT signer,signed_on AS signedOn,evidence FROM portal_crm_signatures WHERE version_id=?').get(id)
    if (existing.signer !== signer || existing.signedOn !== signedOn || existing.evidence !== evidence) {
      fail(409, 'Une signature est déjà confirmée pour cette version.')
    }
  }
  return { id }
}

const installmentTotals = `SELECT installment_id,
  SUM(CASE WHEN kind='receipt' THEN amount_cents ELSE 0 END) AS receipts,
  SUM(CASE WHEN kind='refund' THEN amount_cents ELSE 0 END) AS refunds,
  COUNT(*) AS entries
  FROM portal_finance_entries GROUP BY installment_id`

async function readInstallments(db: PortalDatabase) {
  const rows = await db.prepare(`SELECT s.id,s.invoice_id AS invoiceId,s.due_date AS dueDate,s.amount_cents AS amountCents,
    COALESCE(t.receipts,0) AS receipts,COALESCE(t.refunds,0) AS refunds,COALESCE(t.entries,0) AS entries
    FROM portal_finance_installments s LEFT JOIN (${installmentTotals}) t ON t.installment_id=s.id ORDER BY s.due_date,s.id`).all()
  return rows.map(row => ({
    ...row,
    receipts: Number(row.receipts),
    refunds: Number(row.refunds),
    entries: Number(row.entries),
    remainingCents: row.amountCents - Number(row.receipts) + Number(row.refunds),
  }))
}

export async function commercialOutstanding(db: PortalDatabase): Promise<Array<{
  id: string; invoiceId: string; projectId: string | null; projectName: string;
  organizationId: string | null; organizationName: string; title: string; reference: string;
  dueDate: string; amountCents: number; remainingCents: number
}>> {
  const rows = await db.prepare(`SELECT s.id,s.invoice_id AS invoiceId,i.project_id AS projectId,
    COALESCE(p.name,i.project_name) AS projectName,i.organization_id AS organizationId,
    COALESCE(o.name,i.organization_name) AS organizationName,i.title,i.reference,s.due_date AS dueDate,
    s.amount_cents AS amountCents,s.amount_cents-COALESCE(t.receipts,0)+COALESCE(t.refunds,0) AS remainingCents
    FROM portal_finance_installments s JOIN portal_finance_invoices i ON i.id=s.invoice_id
    LEFT JOIN projects p ON p.id=i.project_id LEFT JOIN organizations o ON o.id=i.organization_id
    LEFT JOIN (${installmentTotals}) t ON t.installment_id=s.id
    WHERE i.cancelled_at IS NULL AND s.amount_cents>COALESCE(t.receipts,0)-COALESCE(t.refunds,0)
    ORDER BY s.due_date,s.id`).all()
  return rows.map(row => ({ ...row, remainingCents: Number(row.remainingCents) }))
}

async function readInvoice(db: PortalDatabase, id: string) {
  const invoice = await db.prepare('SELECT * FROM portal_finance_invoices WHERE id=?').get(id)
  if (!invoice) fail(404, 'Facture introuvable.')
  return invoice
}

async function saveInvoice(db: PortalDatabase, input: Input, actor: string) {
  const id = optionalId(input.id, 'facture')
  const title = field(input.title, 'titre de la facture', 160, true)
  const url = externalUrl(input.externalUrl)
  return db.transaction(async (tx) => {
    let invoice
    if (id) {
      if (!await lockRow(tx, 'portal_finance_invoices', id)) fail(404, 'Facture introuvable.')
      invoice = await readInvoice(tx, id)
      if (invoice.cancelled_at) fail(409, 'Une facture annulée reste dans le journal.')
    }
    const timestamp = now()
    if (invoice) {
      const hasEntries = await tx.prepare(`SELECT e.id FROM portal_finance_entries e
        JOIN portal_finance_installments s ON s.id=e.installment_id WHERE s.invoice_id=? LIMIT 1`).get(id)
      if (hasEntries) {
        const lockedFields = ['projectId', 'reference', 'issuedOn', 'totalCents', 'netCents', 'installments']
        if (lockedFields.some(key => input[key] !== undefined)) fail(409, 'Les données de facturation sont figées après une écriture.')
        await tx.prepare('UPDATE portal_finance_invoices SET title=?,external_url=?,updated_at=? WHERE id=?').run(title, url, timestamp, id)
        return { id }
      }
    }

    const reference = identifier(input.reference, 'référence de facture')
    if (invoice && invoice.reference !== reference) fail(409, 'La référence de la facture est figée.')
    const projectId = identifier(input.projectId, 'projet')
    const project = await tx.prepare(`SELECT p.id,p.name,o.id AS organizationId,o.name AS organizationName
      FROM projects p JOIN organizations o ON o.id=p.organization_id WHERE p.id=?`).get(projectId)
    if (!project) fail(404, 'Projet introuvable.')
    const issuedOn = pastDate(input.issuedOn, 'date d’émission')
    const totalCents = cents(input.totalCents, 'total TTC', 1)
    const netCents = number(input.netCents, 'total HT', 0, totalCents)
    if (!Array.isArray(input.installments) || input.installments.length === 0 || input.installments.length > 36) {
      fail(400, 'Saisissez de 1 à 36 échéances.')
    }
    const installments = input.installments.map(item => {
      const term = object(item)
      const dueDate = date(term.dueDate, 'date d’échéance')
      if (dueDate < issuedOn) fail(400, 'Une échéance précède l’émission de la facture.')
      return { dueDate, amountCents: cents(term.amountCents, 'montant TTC de l’échéance', 1) }
    })
    if (new Set(installments.map(term => term.dueDate)).size !== installments.length) {
      fail(400, 'Regroupez les échéances qui portent la même date.')
    }
    if (installments.reduce((sum, term) => sum + term.amountCents, 0) !== totalCents) {
      fail(400, 'Le total des échéances doit correspondre au total TTC de la facture.')
    }

    const invoiceId = id || randomUUID()
    const common = [projectId, project.name, project.organizationId, project.organizationName, title, issuedOn, url, totalCents, netCents, timestamp, invoiceId]
    if (invoice) {
      await tx.prepare(`UPDATE portal_finance_invoices SET project_id=?,project_name=?,organization_id=?,organization_name=?,
        title=?,issued_on=?,external_url=?,total_cents=?,net_cents=?,updated_at=? WHERE id=?`).run(...common)
    } else {
      const result = await tx.prepare(`INSERT INTO portal_finance_invoices(project_id,project_name,organization_id,organization_name,title,
        issued_on,external_url,total_cents,net_cents,updated_at,id,reference,reference_key,created_by,created_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(reference_key) DO NOTHING`).run(...common, reference, referenceKey(reference), actor, timestamp)
      if (!result.changes) fail(409, 'Cette référence de facture existe déjà.')
    }

    const existing = id ? await tx.prepare('SELECT id,due_date AS dueDate FROM portal_finance_installments WHERE invoice_id=?').all(id) : []
    const requestedDates = new Set(installments.map(term => term.dueDate))
    for (const term of existing) {
      if (!requestedDates.has(term.dueDate)) await tx.prepare('DELETE FROM portal_finance_installments WHERE id=?').run(term.id)
    }
    for (const term of installments) {
      await tx.prepare(`INSERT INTO portal_finance_installments(id,invoice_id,due_date,amount_cents) VALUES(?,?,?,?)
        ON CONFLICT(invoice_id,due_date) DO UPDATE SET amount_cents=excluded.amount_cents`)
        .run(randomUUID(), invoiceId, term.dueDate, term.amountCents)
    }
    return { id: invoiceId }
  })
}

async function cancelInvoice(db: PortalDatabase, input: Input) {
  const id = identifier(input.id, 'facture')
  const reason = field(input.reason, 'motif d’annulation', 500, true)
  return db.transaction(async (tx) => {
    if (!await lockRow(tx, 'portal_finance_invoices', id)) fail(404, 'Facture introuvable.')
    const invoice = await readInvoice(tx, id)
    if (invoice.cancelled_at) {
      if (invoice.cancellation_reason !== reason) fail(409, 'Un motif d’annulation a déjà été enregistré.')
      return { id }
    }
    const received = await tx.prepare(`SELECT COALESCE(SUM(CASE WHEN e.kind='receipt' THEN e.amount_cents WHEN e.kind='refund' THEN -e.amount_cents ELSE 0 END),0) AS net
      FROM portal_finance_entries e JOIN portal_finance_installments s ON s.id=e.installment_id WHERE s.invoice_id=?`).get(id)
    if (Number(received.net) > 0) fail(409, 'Saisissez les remboursements avant d’annuler une facture encaissée.')
    const timestamp = now()
    await tx.prepare('UPDATE portal_finance_invoices SET cancelled_at=?,cancellation_reason=?,updated_at=? WHERE id=?').run(timestamp, reason, timestamp, id)
    return { id }
  })
}

export async function recordCommercialEntry(db: PortalDatabase, value: unknown, source: EntrySource, actor: string | null) {
  const input = object(value)
  const installmentId = identifier(input.installmentId, 'échéance')
  const reference = field(input.reference, source === 'manual' ? 'référence du mouvement' : 'identifiant d’événement', 180, true)
  const key = source === 'manual' ? referenceKey(reference) : reference
  const kind = input.kind
  if (kind !== 'receipt' && kind !== 'refund' && kind !== 'failed') fail(400, 'Type de mouvement invalide.')
  if (source === 'webhook' && input.currency !== 'EUR') fail(400, 'Devise invalide · EUR attendu.')
  const amount = cents(input.amountCents, 'montant TTC du mouvement', 1)
  const occurredOn = pastDate(input.occurredOn, 'date du mouvement')
  const note = field(input.note, 'note de rapprochement', 2000)
  const readDuplicate = async (tx: PortalDatabase) => {
    const existing = await tx.prepare(`SELECT id,installment_id AS installmentId,kind,amount_cents AS amountCents,occurred_on AS occurredOn,note
      FROM portal_finance_entries WHERE source=? AND reference_key=?`).get(source, key)
    if (!existing) return null
    if (existing.installmentId !== installmentId || existing.kind !== kind || existing.amountCents !== amount || existing.occurredOn !== occurredOn || existing.note !== note) {
      fail(409, 'Cette référence correspond déjà à un mouvement différent.')
    }
    return { id: existing.id as string, duplicate: true }
  }

  return db.transaction(async (tx) => {
    const duplicate = await readDuplicate(tx)
    if (duplicate) return duplicate
    const term = await tx.prepare('SELECT invoice_id AS invoiceId FROM portal_finance_installments WHERE id=?').get(installmentId)
    if (!term || !await lockRow(tx, 'portal_finance_invoices', term.invoiceId)) fail(404, 'Échéance introuvable.')
    const pendingDuplicate = await readDuplicate(tx)
    if (pendingDuplicate) return pendingDuplicate
    const invoice = await readInvoice(tx, term.invoiceId)
    if (invoice.cancelled_at) fail(409, 'La facture est annulée.')
    const installment = await tx.prepare('SELECT amount_cents AS amountCents FROM portal_finance_installments WHERE id=?').get(installmentId)
    if (!installment) fail(404, 'Échéance introuvable.')
    if (amount > installment.amountCents) fail(409, 'Le mouvement dépasse le montant de cette échéance.')
    const id = randomUUID()
    const entry = await tx.prepare(`INSERT INTO portal_finance_entries(id,installment_id,source,reference,reference_key,kind,amount_cents,occurred_on,note,recorded_by,recorded_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(source,reference_key) DO NOTHING`)
      .run(id, installmentId, source, reference, key, kind, amount, occurredOn, note, actor, now())
    if (!entry.changes) return await readDuplicate(tx)

    // Verify the historical balance too, in case the movement is dated before a recorded refund.
    const history = await tx.prepare(`SELECT SUM(CASE WHEN kind='receipt' THEN amount_cents WHEN kind='refund' THEN -amount_cents ELSE 0 END) AS movement
      FROM portal_finance_entries WHERE installment_id=? GROUP BY occurred_on ORDER BY occurred_on`).all(installmentId)
    let balance = 0
    for (const movement of history) {
      balance += Number(movement.movement)
      if (balance < 0) fail(409, 'Le remboursement dépasse les encaissements disponibles à cette date.')
      if (balance > installment.amountCents) fail(409, 'Les encaissements dépassent le montant de cette échéance.')
    }
    return { id, duplicate: false }
  })
}

async function saveBudget(db: PortalDatabase, input: Input) {
  const projectId = identifier(input.projectId, 'projet')
  const estimatedMinutes = number(input.estimatedMinutes, 'durée estimée', 0, 60_000_000)
  const estimatedCents = cents(input.estimatedCents, 'coûts HT estimés')
  return db.transaction(async (tx) => {
    if (!await lockRow(tx, 'projects', projectId)) fail(404, 'Projet introuvable.')
    await tx.prepare(`INSERT INTO portal_finance_budgets(project_id,estimated_minutes,estimated_cost_cents,updated_at) VALUES(?,?,?,?)
      ON CONFLICT(project_id) DO UPDATE SET estimated_minutes=excluded.estimated_minutes,
      estimated_cost_cents=excluded.estimated_cost_cents,updated_at=excluded.updated_at`).run(projectId, estimatedMinutes, estimatedCents, now())
    return { id: projectId }
  })
}

async function saveCost(db: PortalDatabase, input: Input, actor: string) {
  const id = optionalId(input.id, 'coût réel')
  const projectId = identifier(input.projectId, 'projet')
  const label = field(input.label, 'libellé du coût réel', 160, true)
  const occurredOn = pastDate(input.occurredOn, 'date de la saisie')
  const minutes = number(input.minutes, 'durée réelle', 0, 60_000_000)
  const costCents = cents(input.costCents, 'coût réel HT')
  if (!minutes && !costCents) fail(400, 'Saisissez une durée ou un coût.')
  return db.transaction(async (tx) => {
    const project = await lockRow(tx, 'projects', projectId)
    if (!project) fail(404, 'Projet introuvable.')
    const { name } = await tx.prepare('SELECT name FROM projects WHERE id=?').get(projectId)
    const timestamp = now()
    if (id) {
      const updated = await tx.prepare(`UPDATE portal_finance_costs SET label=?,occurred_on=?,minutes=?,cost_cents=?,updated_at=?
        WHERE id=? AND project_id=?`).run(label, occurredOn, minutes, costCents, timestamp, id, projectId)
      if (!updated.changes) fail(404, 'Coût réel introuvable pour ce projet.')
      return { id }
    }
    const costId = randomUUID()
    await tx.prepare(`INSERT INTO portal_finance_costs(id,project_id,project_name,label,occurred_on,minutes,cost_cents,created_by,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?)`).run(costId, projectId, name, label, occurredOn, minutes, costCents, actor, timestamp, timestamp)
    return { id: costId }
  })
}

async function removeCost(db: PortalDatabase, input: Input) {
  const id = identifier(input.id, 'coût réel')
  const deleted = await db.prepare('DELETE FROM portal_finance_costs WHERE id=?').run(id)
  if (!deleted.changes) fail(404, 'Coût réel introuvable.')
  return { id }
}

export async function commercialSnapshot(db: PortalDatabase) {
  return db.transaction(async tx => {
    if (tx.dialect === 'postgres') await tx.prepare('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY').run()
    const contacts = await tx.prepare(`SELECT c.id,c.organization_id AS organizationId,o.name AS organizationName,c.name,c.company,c.email,c.phone,
      c.role,c.notes,c.archived_at AS archivedAt,c.created_at AS createdAt,c.updated_at AS updatedAt
      FROM portal_crm_contacts c LEFT JOIN organizations o ON o.id=c.organization_id ORDER BY c.archived_at IS NOT NULL,c.name,c.id`).all()
    const opportunities = await tx.prepare(`SELECT ${opportunityColumns} FROM portal_crm_opportunities ORDER BY updated_at DESC,id`).all()
    const historyRows = await tx.prepare(`SELECT h.id,h.opportunity_id AS opportunityId,h.kind,h.snapshot,u.name AS author,h.created_at AS createdAt
      FROM portal_crm_opportunity_history h LEFT JOIN users u ON u.id=h.author_id ORDER BY h.created_at DESC,h.id`).all()
    const history = historyRows.map(row => ({ ...row, snapshot: JSON.parse(row.snapshot) }))
    const calls = await tx.prepare(`SELECT c.id,c.opportunity_id AS opportunityId,c.occurred_on AS occurredOn,c.raw_notes AS rawNotes,c.summary,c.commitments,
      c.owners,c.unknowns,u.name AS author,c.created_at AS createdAt,c.updated_at AS updatedAt
      FROM portal_crm_calls c LEFT JOIN users u ON u.id=c.author_id ORDER BY c.occurred_on DESC,c.created_at DESC,c.id`).all()
    const documents = await tx.prepare(`SELECT d.id,d.opportunity_id AS opportunityId,d.kind,d.created_at AS createdAt
      FROM portal_crm_documents d ORDER BY d.created_at DESC,d.id`).all()
    const versions = await tx.prepare(`SELECT v.id,v.document_id AS documentId,v.version,v.title,v.scope,v.exclusions,v.schedule,v.amount_cents AS amountCents,
      v.external_url AS externalUrl,v.created_at AS createdAt,u.name AS author,
      s.signer,s.signed_on AS signedOn,s.evidence,s.recorded_at AS recordedAt,su.name AS recordedBy
      FROM portal_crm_document_versions v LEFT JOIN users u ON u.id=v.author_id LEFT JOIN portal_crm_signatures s ON s.version_id=v.id
      LEFT JOIN users su ON su.id=s.recorded_by ORDER BY v.version DESC,v.id`).all()
    const organizations = await tx.prepare('SELECT id,name FROM organizations ORDER BY name,id').all()
    const projects = await tx.prepare(`SELECT p.id,p.name,p.organization_id AS organizationId,o.name AS organizationName,
      b.estimated_minutes AS estimatedMinutes,b.estimated_cost_cents AS estimatedCents
      FROM projects p JOIN organizations o ON o.id=p.organization_id LEFT JOIN portal_finance_budgets b ON b.project_id=p.id
      ORDER BY o.name,p.name,p.id`).all()
    const invoices = await tx.prepare(`SELECT i.id,i.project_id AS projectId,COALESCE(p.name,i.project_name) AS projectName,
      i.organization_id AS organizationId,COALESCE(o.name,i.organization_name) AS organizationName,i.reference,i.title,i.issued_on AS issuedOn,
      i.external_url AS externalUrl,i.total_cents AS totalCents,i.net_cents AS netCents,i.cancelled_at AS cancelledAt,
      i.cancellation_reason AS cancellationReason FROM portal_finance_invoices i LEFT JOIN projects p ON p.id=i.project_id
      LEFT JOIN organizations o ON o.id=i.organization_id ORDER BY i.issued_on DESC,i.id`).all()
    const installments = await readInstallments(tx)
    const entries = await tx.prepare(`SELECT e.id,e.installment_id AS installmentId,e.source,e.reference,e.kind,e.amount_cents AS amountCents,
      e.occurred_on AS occurredOn,e.note,u.name AS recordedBy,e.recorded_at AS recordedAt
      FROM portal_finance_entries e LEFT JOIN users u ON u.id=e.recorded_by ORDER BY e.occurred_on DESC,e.recorded_at DESC,e.id`).all()
    const costs = await tx.prepare(`SELECT c.id,c.project_id AS projectId,COALESCE(p.name,c.project_name) AS projectName,c.label,
      c.occurred_on AS occurredOn,c.minutes,c.cost_cents AS costCents,u.name AS author
      FROM portal_finance_costs c LEFT JOIN projects p ON p.id=c.project_id LEFT JOIN users u ON u.id=c.created_by
      ORDER BY c.occurred_on DESC,c.created_at DESC,c.id`).all()
    const timeSessions = await readProjectTimeHistory(tx)

    const outstanding = await commercialOutstanding(tx)
    const currentDate = today()
    const summary = {
      expectedCents: outstanding.reduce((sum, term) => sum + term.remainingCents, 0),
      overdueCents: outstanding.filter(term => term.dueDate < currentDate).reduce((sum, term) => sum + term.remainingCents, 0),
      receipts: installments.reduce((sum, term) => sum + term.receipts, 0),
      refunds: installments.reduce((sum, term) => sum + term.refunds, 0),
    }
    return { contacts, opportunities, history, calls, documents, versions, organizations, projects, invoices, installments,
      entries, costs, timeSessions, outstanding, summary, today: currentDate }
  })
}

export async function commercialMutation(db: PortalDatabase, value: unknown, actor: string) {
  const input = object(value)
  switch (input.action) {
    case 'saveContact': return saveCommercialContact(db, input)
    case 'archiveContact': return archiveContact(db, input)
    case 'saveOpportunity': return saveOpportunity(db, input, actor)
    case 'convertOpportunity': return convertOpportunity(db, input, actor)
    case 'saveCall': return saveCall(db, input, actor)
    case 'saveDocumentVersion': return saveDocumentVersion(db, input, actor)
    case 'recordSignature': return recordSignature(db, input, actor)
    case 'saveInvoice': return saveInvoice(db, input, actor)
    case 'cancelInvoice': return cancelInvoice(db, input)
    case 'recordEntry': return recordCommercialEntry(db, input, 'manual', actor)
    case 'saveBudget': return saveBudget(db, input)
    case 'saveCost': return saveCost(db, input, actor)
    case 'removeCost': return removeCost(db, input)
    default: return fail(400, 'Action commerciale inconnue.')
  }
}
