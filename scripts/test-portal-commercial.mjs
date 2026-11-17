#!/usr/bin/env node
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHash, createHmac } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { commercialMutation, commercialOutstanding, commercialSnapshot, recordCommercialEntry } from '../server/utils/portal-commercial.ts'
import { portalDb } from '../server/utils/portal-db.ts'

// Run with `node scripts/test-portal-commercial.mjs`. Set PORTAL_COMMERCIAL_HTTP=1 for the isolated Nuxt route checks.
const directory = mkdtempSync(join(tmpdir(), 'mc-portal-commercial-'))
const path = join(directory, 'portal.sqlite')
process.env.DATABASE_URL = ''
process.env.NUXT_DATABASE_URL = ''
process.env.NUXT_PORTAL_DB_PATH = path
process.env.NODE_ENV = 'development'
const db = await portalDb()
const mutate = (action, fields) => commercialMutation(db, { action, ...fields }, 'admin')
const status = code => error => error.statusCode === code
let server
let closed = false
try {
  await db.prepare("INSERT INTO organizations(id,name) VALUES('client-org','Client existant')").run()
  await db.prepare("INSERT INTO users(id,email,name,password_hash,role) VALUES('admin','admin@example.test','Admin commercial','unused','admin')").run()
  await db.prepare("INSERT INTO users(id,email,name,password_hash,role,organization_id) VALUES('client','client@example.test','Compte client','unused','client','client-org')").run()

  const contact = await mutate('saveContact', { name: 'Camille', company: 'Atelier Camille', email: ' C@Example.test ', role: 'Direction' })
  const savedContact = (await commercialSnapshot(db)).contacts[0]
  assert.equal(savedContact.organizationId, null)
  assert.equal(savedContact.email, 'c@example.test')
  assert.equal((await db.prepare('SELECT COUNT(*) AS count FROM users').get()).count, 2)
  await mutate('saveContact', { ...savedContact, notes: 'Préférence de contact' })
  await mutate('archiveContact', { id: contact.id, archived: true })
  assert.ok((await commercialSnapshot(db)).contacts[0].archivedAt)

  const opportunity = {
    contactId: contact.id, title: 'Site Atelier', source: 'Recommandation', amountCents: 300_000,
    stage: 'network', probability: 10, nextAction: 'Reprendre contact', nextActionDate: '2090-01-04'
  }
  await assert.rejects(mutate('saveOpportunity', opportunity), status(400))
  await mutate('archiveContact', { id: contact.id, archived: false })
  await assert.rejects(mutate('saveOpportunity', { ...opportunity, nextAction: '' }), status(400))
  const pending = await mutate('saveOpportunity', { ...opportunity, title: 'Nouvelle demande', nextActionDate: '' })
  assert.equal((await commercialSnapshot(db)).opportunities.find(item => item.id === pending.id).nextAction, opportunity.nextAction)
  const { id: opportunityId } = await mutate('saveOpportunity', opportunity)
  const conversion = { id: opportunityId, organizationName: 'Atelier Camille', projectName: 'Site Atelier' }
  await assert.rejects(mutate('convertOpportunity', conversion), status(409))
  await assert.rejects(mutate('saveOpportunity', { id: opportunityId, ...opportunity, stage: 'lost' }), status(400))
  await mutate('saveOpportunity', { id: opportunityId, ...opportunity, stage: 'won', probability: 100 })
  const [converted, repeated] = await Promise.all([mutate('convertOpportunity', conversion), mutate('convertOpportunity', conversion)])
  assert.deepEqual(converted, repeated)
  const { projectId, organizationId } = converted
  assert.equal((await db.prepare('SELECT COUNT(*) AS count FROM projects').get()).count, 1)
  assert.equal((await commercialSnapshot(db)).contacts[0].organizationId, organizationId)
  assert.equal((await commercialSnapshot(db)).history.filter(item => item.kind === 'converted').length, 1)
  await assert.rejects(mutate('saveOpportunity', { id: opportunityId, ...opportunity, stage: 'proposal' }), status(409))

  const call = { opportunityId, occurredOn: '2025-06-01', rawNotes: 'Verbatim', summary: 'Comprendre le délai', commitments: 'Envoyer le devis', owners: 'Camille', unknowns: 'Budget' }
  const callRecord = await mutate('saveCall', call)
  await mutate('saveCall', { ...call, id: callRecord.id, summary: 'Synthèse revue' })
  assert.deepEqual((await commercialSnapshot(db)).calls.map(row => [row.rawNotes, row.summary, row.owners]), [['Verbatim', 'Synthèse revue', 'Camille']])

  const quote = { opportunityId, kind: 'quote', title: 'Site Atelier', scope: 'Accueil', exclusions: 'Catalogue', schedule: 'Deux échéances', amountCents: 300_000 }
  const v1 = await mutate('saveDocumentVersion', quote)
  const v2 = await mutate('saveDocumentVersion', { ...quote, documentId: v1.id, scope: 'Accueil et contact' })
  assert.equal(v2.version, 2)
  await assert.rejects(mutate('saveDocumentVersion', { ...quote, externalUrl: 'javascript:alert(1)' }), status(400))
  const signature = { versionId: v1.versionId, signer: 'Camille', signedOn: '2025-06-01', evidence: 'Référence du document reçu' }
  await mutate('recordSignature', signature)
  await mutate('recordSignature', signature)
  await assert.rejects(mutate('recordSignature', { ...signature, signer: 'Autre nom' }), status(409))
  const versions = (await commercialSnapshot(db)).versions
  assert.deepEqual(versions.map(version => [version.version, version.scope, version.signer]), [[2, 'Accueil et contact', null], [1, 'Accueil', 'Camille']])

  const invoiceInput = {
    projectId, reference: 'INV-101', title: 'Site Atelier', issuedOn: '2025-06-01', totalCents: 12_000, netCents: 10_000,
    installments: [{ dueDate: '2025-06-20', amountCents: 6_000 }, { dueDate: '2090-01-10', amountCents: 6_000 }]
  }
  await assert.rejects(mutate('saveInvoice', { ...invoiceInput, totalCents: 13_000 }), status(400))
  await assert.rejects(mutate('saveInvoice', { ...invoiceInput, totalCents: 12000.25 }), status(400))
  const { id: invoiceId } = await mutate('saveInvoice', invoiceInput)
  await assert.rejects(mutate('saveInvoice', { ...invoiceInput, reference: 'inv-101' }), status(409))
  const [term, anotherTerm] = (await commercialSnapshot(db)).installments
  await mutate('saveInvoice', { id: invoiceId, ...invoiceInput, title: 'Site Atelier phase 1' })
  assert.equal((await commercialSnapshot(db)).installments[0].id, term.id)
  const entry = { installmentId: term.id, kind: 'receipt', reference: 'Virement-01', amountCents: 5_000, occurredOn: '2025-06-02' }
  const first = await mutate('recordEntry', entry)
  const duplicate = await mutate('recordEntry', { ...entry, reference: 'virement-01' })
  assert.deepEqual(duplicate, { id: first.id, duplicate: true })
  await assert.rejects(mutate('recordEntry', { ...entry, installmentId: anotherTerm.id }), status(409))
  await assert.rejects(mutate('recordEntry', { ...entry, amountCents: 123 }), status(409))
  await assert.rejects(mutate('recordEntry', { ...entry, reference: 'Virement-02', amountCents: 1_001 }), status(409))
  await assert.rejects(mutate('recordEntry', { ...entry, reference: 'Remboursement-01', kind: 'refund', amountCents: 5_001 }), status(409))
  await assert.rejects(mutate('recordEntry', { ...entry, reference: 'Remboursement-01', kind: 'refund', amountCents: 1_000, occurredOn: '2025-06-01' }), status(409))
  await assert.rejects(mutate('saveInvoice', { ...invoiceInput, id: invoiceId }), status(409))
  await assert.rejects(mutate('cancelInvoice', { id: invoiceId, reason: 'Annulation test' }), status(409))

  await mutate('recordEntry', { ...entry, reference: 'Remboursement-01', kind: 'refund', amountCents: 1_000 })
  const event = { ...entry, reference: 'evt_001', kind: 'failed', amountCents: 2_000, currency: 'EUR' }
  const failed = await recordCommercialEntry(db, event, 'webhook', null)
  assert.equal(failed.duplicate, false)
  assert.equal((await recordCommercialEntry(db, event, 'webhook', null)).duplicate, true)
  await assert.rejects(recordCommercialEntry(db, { ...event, reference: 'evt_002', currency: 'USD' }, 'webhook', null), status(400))
  assert.deepEqual((await commercialOutstanding(db)).map(row => [row.id, row.remainingCents, row.organizationId]),
    [[term.id, 2_000, organizationId], [anotherTerm.id, 6_000, organizationId]])
  assert.deepEqual((await commercialSnapshot(db)).summary, { expectedCents: 8_000, overdueCents: 2_000, receipts: 5_000, refunds: 1_000 })
  assert.equal((await commercialSnapshot(db)).entries.length, 3)

  await db.prepare("INSERT INTO projects(id,organization_id,name) VALUES('deleted-project','client-org','Projet supprimable')").run()
  const retentionInvoice = await mutate('saveInvoice', { ...invoiceInput, projectId: 'deleted-project', reference: 'INV-100', issuedOn: '2025-05-31',
    totalCents: 1000, netCents: 900, installments: [{ dueDate: '2025-06-05', amountCents: 1000 }] })
  const retentionTerm = (await commercialSnapshot(db)).installments.find(item => item.invoiceId === retentionInvoice.id)
  await mutate('recordEntry', { ...entry, installmentId: retentionTerm.id, reference: 'Virement-02', amountCents: 1000 })
  await db.prepare("DELETE FROM projects WHERE id='deleted-project'").run()
  assert.deepEqual((await commercialSnapshot(db)).invoices.filter(item => item.id === retentionInvoice.id).map(item => [item.projectId, item.projectName]),
    [[null, 'Projet supprimable']])
  await mutate('recordEntry', { ...entry, installmentId: retentionTerm.id, reference: 'Remboursement-02', kind: 'refund', amountCents: 1000 })
  await mutate('cancelInvoice', { id: retentionInvoice.id, reason: 'Facture remplacée après remboursement' })
  assert.ok(!(await commercialOutstanding(db)).some(item => item.invoiceId === retentionInvoice.id))
  assert.equal((await commercialSnapshot(db)).entries.filter(item => item.installmentId === retentionTerm.id).length, 2)

  await mutate('saveBudget', { projectId, estimatedMinutes: 60, estimatedCents: 6_000 })
  const cost = { projectId, label: 'Atelier', occurredOn: '2025-06-03', minutes: 90, costCents: 7_500 }
  const { id: costId } = await mutate('saveCost', cost)
  await mutate('saveCost', { id: costId, ...cost, minutes: 80 })
  assert.equal((await commercialSnapshot(db)).costs[0].minutes, 80)
  assert.equal((await commercialSnapshot(db)).projects[0].estimatedCents, 6_000)
  await mutate('removeCost', { id: costId })
  assert.equal((await commercialSnapshot(db)).costs.length, 0)
  console.log('PASS comptes CRM, pipeline, conversion concurrente, appels, documents, signatures, factures et journal')

  if (process.env.PORTAL_COMMERCIAL_HTTP === '1') {
    const token = role => `session-test-${role}`
    const digest = value => createHash('sha256').update(value).digest('hex')
    for (const role of ['admin', 'client']) {
      await db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,'2090-01-01T00:00:00.000Z')").run(digest(token(role)), role)
    }
    await db.close()
    closed = true
    const dotenv = join(directory, 'empty.env')
    const port = Number(process.env.PORTAL_COMMERCIAL_TEST_PORT || 4188)
    const base = `http://127.0.0.1:${port}`
    const secret = 'commercial-test-secret-with-at-least-32-bytes'
    writeFileSync(dotenv, '')
    server = spawn(process.execPath, ['node_modules/nuxt/bin/nuxt.mjs', 'dev', '--host', '127.0.0.1', '--port', String(port), '--dotenv', dotenv], {
      env: { ...process.env, PORTAL_PAYMENT_WEBHOOK_SECRET: secret, NUXT_PUBLIC_SITE_URL: base, PORTAL_EMAIL_DISABLED: '1' },
      stdio: process.env.PORTAL_TEST_DEBUG ? 'inherit' : 'ignore'
    })
    let ready = false
    for (let attempt = 0; attempt < 160 && server.exitCode === null; attempt++) {
      try {
        ready = (await fetch(`${base}/api/portal/auth/me`, { signal: AbortSignal.timeout(5000) })).ok
        if (ready) break
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    assert.ok(ready, 'Nuxt test server should start')
    const cookie = role => ({ cookie: `mc_portal_session=${token(role)}` })
    const admin = `${base}/api/portal/admin/commercial`
    assert.equal((await fetch(admin)).status, 401)
    assert.equal((await fetch(admin, { headers: cookie('client') })).status, 403)
    const view = await fetch(admin, { headers: cookie('admin') })
    assert.equal(view.status, 200, await view.clone().text())
    assert.equal(view.headers.get('cache-control'), 'private, no-store')
    assert.equal((await view.json()).invoices[0].reference, 'INV-101')
    const write = (role, origin) => fetch(admin, { method: 'POST', headers: { ...cookie(role), origin, 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'saveContact', name: 'Test HTTP' }) })
    assert.equal((await write('client', base)).status, 403)
    assert.equal((await write('admin', 'https://different.example')).status, 403)
    assert.equal((await write('admin', base)).status, 200)
    for (const path of ['/studio', '/studio/templates']) {
      const url = `${base}/api/portal/admin${path}`
      assert.equal((await fetch(url)).status, 401)
      assert.equal((await fetch(url, { headers: cookie('client') })).status, 403)
      assert.equal((await fetch(url, { headers: cookie('admin') })).status, 200)
    }
    for (const path of ['/studio/onboarding', '/studio/onboarding/preview', '/studio/templates/application']) {
      const url = `${base}/api/portal/admin${path}`
      const mutation = (role, origin) => fetch(url, { method: 'POST',
        headers: { ...cookie(role), origin, 'content-type': 'application/json' }, body: '{}' })
      assert.equal((await mutation('client', base)).status, 403)
      assert.equal((await mutation('admin', 'https://different.example')).status, 403)
    }
    const raw = JSON.stringify({ ...event, reference: 'evt_http_1', kind: 'receipt', amountCents: 500 }, null, 1)
    const sig = createHmac('sha256', secret).update(raw).digest('hex')
    const postEvent = (body, signature) => fetch(`${base}/api/portal/commercial/payment-webhook`, { method: 'POST',
      headers: { 'content-type': 'application/json', 'x-portal-signature': signature }, body })
    assert.equal((await postEvent(raw + ' ', sig)).status, 401)
    assert.equal((await postEvent(raw, '00'.repeat(32))).status, 401)
    const invalidJson = '{'
    assert.equal((await postEvent(invalidJson, createHmac('sha256', secret).update(invalidJson).digest('hex'))).status, 400)
    const accepted = await postEvent(raw, sig)
    assert.equal(accepted.status, 200, await accepted.clone().text())
    const acceptedData = await accepted.json()
    assert.equal(acceptedData.duplicate, false)
    assert.deepEqual(await (await postEvent(raw, sig)).json(), { id: acceptedData.id, duplicate: true })
    const maliciouslyDifferent = raw.replace('500', '600')
    const signedDifferent = createHmac('sha256', secret).update(maliciouslyDifferent).digest('hex')
    assert.equal((await postEvent(maliciouslyDifferent, signedDifferent)).status, 409)
    console.log('PASS authentification, origine, HMAC sur le corps exact et déduplication via HTTP')
  }
} finally {
  if (server && server.exitCode === null) {
    const exited = new Promise(resolve => server.once('exit', resolve))
    server.kill()
    await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 3000).unref())])
    if (server.exitCode === null) server.kill('SIGKILL')
  }
  if (!closed) await db.close()
  rmSync(directory, { recursive: true, force: true })
}
