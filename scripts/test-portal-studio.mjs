#!/usr/bin/env node
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { portalDb } from '../server/utils/portal-db.ts'
import {
  launchStudioOnboarding, previewStudioOnboarding, qualifyStudioRequest, reviseStudioTemplate,
  studioCockpit, studioDay, studioTemplate, studioTemplates
} from '../server/utils/portal-studio.ts'

const temporary = mkdtempSync(join(tmpdir(), 'mc-portal-studio-'))
process.env.DATABASE_URL = ''
process.env.NUXT_DATABASE_URL = ''
process.env.NODE_ENV = 'development'
process.env.NUXT_PORTAL_DB_PATH = join(temporary, 'portal.sqlite')
let db
const status = expected => error => error.statusCode === expected

try {
  db = await portalDb()
  const run = (sql, ...args) => db.prepare(sql).run(...args)
  const get = (sql, ...args) => db.prepare(sql).get(...args)
  const count = async (table, projectId) => Number((await get(`SELECT COUNT(*) AS total FROM ${table} WHERE project_id=?`, projectId)).total)
  await run("INSERT INTO organizations(id,name) VALUES('org','Client Atelier'),('other','Autre client')")
  await run(`INSERT INTO users(id,email,name,password_hash,role,organization_id) VALUES
    ('admin','admin@test.invalid','Équipe MC','test','admin',NULL),('member','member@test.invalid','Camille','test','client','org')`)
  await run("INSERT INTO projects(id,organization_id,name,description,due_date) VALUES('converted','org','Projet CRM','Brief commercial','2099-04-01')")

  const catalog = await studioTemplates(db)
  assert.deepEqual(catalog.templates.map(template => template.id), ['application', 'website', 'maintenance'])
  assert.deepEqual(catalog.existingProjects.map(project => project.id), ['converted'])
  assert.equal(studioDay(new Date('2026-03-29T22:30:00.000Z')), '2026-03-30')
  const first = await studioTemplate(db, 'website', 1)
  const input = {
    organizationId: 'org', templateId: 'website', templateVersion: 1, name: 'Site Atelier',
    description: 'Description', startDate: '2028-02-28'
  }
  const plan = await previewStudioOnboarding(db, input)
  assert.equal(plan.phases[0].steps[0].endDate, '2028-02-29')
  assert.equal(plan.dueDate, '2028-03-21')
  assert.equal((await get('SELECT COUNT(*) AS total FROM portal_studio_launches')).total, 0)
  await assert.rejects(previewStudioOnboarding(db, { ...input, startDate: '2027-02-29' }), status(400))
  await assert.rejects(previewStudioOnboarding(db, { ...input, templateVersion: 3 }), status(404))
  await assert.rejects(previewStudioOnboarding(db, { ...input, organizationId: 'missing' }), status(404))
  console.log('PASS catalogue, aperçu sans écriture et dates civiles')

  const revision = { version: 1, definition: { ...first.definition, title: 'Site catalogue' } }
  const revisions = await Promise.allSettled([
    reviseStudioTemplate(db, 'admin', 'website', revision),
    reviseStudioTemplate(db, 'admin', 'website', revision)
  ])
  assert.equal(revisions.filter(result => result.status === 'fulfilled').length, 1)
  assert.equal(revisions.find(result => result.status === 'rejected').reason.statusCode, 409)
  assert.equal((await studioTemplate(db, 'website', 1)).definition.title, first.definition.title)
  assert.equal((await studioTemplate(db, 'website', 2)).definition.title, 'Site catalogue')
  const malformed = structuredClone(first.definition)
  malformed.phases[0].steps[0].endDay = 42
  await assert.rejects(reviseStudioTemplate(db, 'admin', 'website', { version: 2, definition: malformed }), status(400))
  console.log('PASS révisions immuables et validation des bornes')

  const payload = { ...input, idempotencyKey: 'test-launch-key-00001' }
  await assert.rejects(launchStudioOnboarding(db, 'missing-actor', payload), /FOREIGN KEY/)
  assert.equal((await get("SELECT COUNT(*) AS total FROM projects WHERE name='Site Atelier'")).total, 0)
  assert.equal((await get('SELECT COUNT(*) AS total FROM portal_studio_launches')).total, 0)
  const [creation, replay] = await Promise.all([
    launchStudioOnboarding(db, 'admin', payload),
    launchStudioOnboarding(db, 'admin', payload)
  ])
  assert.equal(creation.projectId, replay.projectId)
  assert.equal(creation.replayed, false)
  assert.equal(replay.replayed, true)
  assert.equal(await count('portal_roadmap_phases', creation.projectId), plan.phases.length)
  assert.equal(await count('portal_roadmap_steps', creation.projectId), plan.phases.reduce((total, phase) => total + phase.steps.length, 0))
  assert.equal(await count('portal_file_requests', creation.projectId), plan.files.length)
  assert.equal(await count('invitations', creation.projectId), 0)
  assert.equal(await count('portal_notifications', creation.projectId), 0)
  await assert.rejects(launchStudioOnboarding(db, 'admin', { ...payload, name: 'Autre projet' }), status(409))
  console.log('PASS écriture atomique, appels simultanés, absence d’envoi et replay')

  const converted = {
    ...input, existingProjectId: 'converted', startDate: '2099-03-01'
  }
  await assert.rejects(previewStudioOnboarding(db, { ...converted, organizationId: 'other' }), status(404))
  await assert.rejects(previewStudioOnboarding(db, { ...converted, startDate: '2099-03-25' }), status(409))
  const existingPlan = await previewStudioOnboarding(db, converted)
  assert.equal(existingPlan.name, 'Projet CRM')
  assert.equal(existingPlan.dueDate, '2099-04-01')
  const existing = await launchStudioOnboarding(db, 'admin', { ...converted, idempotencyKey: 'test-existing-project-0001' })
  assert.equal(existing.projectId, 'converted')
  assert.equal((await get("SELECT description FROM projects WHERE id='converted'")).description, 'Brief commercial')
  assert.equal((await launchStudioOnboarding(db, 'admin', { ...converted, idempotencyKey: 'test-existing-project-0001' })).replayed, true)
  await assert.rejects(launchStudioOnboarding(db, 'admin', { ...converted, idempotencyKey: 'test-existing-project-0002' }), status(409))
  assert.deepEqual((await studioTemplates(db)).existingProjects, [])
  console.log('PASS onboarding d’un projet CRM vierge et refus d’un second lancement')

  await run(`INSERT INTO portal_requests(id,project_id,title,body,created_by,created_at,updated_at)
    VALUES('req','converted','Ajuster les textes','Ma demande','member','2099-03-01','2099-03-01')`)
  await run(`INSERT INTO resources(id,project_id,kind,title,status,due_date,created_by)
    VALUES('due','converted','payment','Acompte','due','2099-03-02','admin'),
          ('paid','converted','payment','Facture réglée','paid','2099-03-02','admin'),
          ('mockup','converted','mockup','Validation de la maquette','pending','2099-03-05','admin')`)
  await run(`INSERT INTO portal_crm_opportunities(id,title,source,amount_cents,stage,created_at,updated_at)
    VALUES('lead','Demande entrante','formulaire',0,'new','2099-03-01','2099-03-01')`)
  await run(`INSERT INTO portal_operation_runs(id,project_id,scenario,idempotency_key,source,status,available_at,created_at,updated_at)
    VALUES('failure','converted','reminders','reminder-test','manual','failed','2099-03-01','2099-03-01','2099-03-01')`)
  const qualification = {
    organizationId: 'org', projectId: 'converted', classification: 'evolution', priority: 'urgent',
    responsibleId: 'admin', dueDate: '2099-03-02', snoozedUntil: null
  }
  await assert.rejects(qualifyStudioRequest(db, 'admin', 'req', { ...qualification, organizationId: 'other' }), status(404))
  await assert.rejects(qualifyStudioRequest(db, 'admin', 'req', { ...qualification, responsibleId: 'member' }), status(400))
  await assert.rejects(qualifyStudioRequest(db, 'admin', 'req', { ...qualification, dueDate: '2099-02-29' }), status(400))
  const cockpitDay = '2099-03-04'
  await qualifyStudioRequest(db, 'admin', 'req', qualification)
  let queue = await studioCockpit(db, [], cockpitDay)
  assert.deepEqual(new Set(queue.items.map(item => item.category)), new Set(['request', 'validation', 'document', 'deliverable', 'payment']))
  assert.equal(queue.items.some(item => item.id === 'paid'), false)
  assert.equal(queue.priorities.length, 3)
  assert.equal(queue.priorities[0].id, 'req')
  assert.match(queue.priorities[0].reason, /Priorité urgente.*En retard/)
  assert.deepEqual(queue.priorities[0].link, { clientId: 'org', projectId: 'converted', tab: 'requests', requestId: 'req' })
  assert.deepEqual(queue.decisions.map(item => item.id), ['run:failure', 'opportunity:lead'])
  await qualifyStudioRequest(db, 'admin', 'req', { ...qualification, snoozedUntil: '2099-03-05' })
  queue = await studioCockpit(db, [], cockpitDay)
  assert.equal(queue.items.find(item => item.id === 'req').snoozed, true)
  assert.equal(queue.priorities.some(item => item.id === 'req'), false)
  assert.equal((await studioCockpit(db, [], '2099-03-05')).items.find(item => item.id === 'req').snoozed, false)
  assert.equal((await get("SELECT status FROM portal_requests WHERE id='req'")).status, 'open')
  await run("UPDATE portal_requests SET status='resolved',resolved_at='2099-03-05',resolved_by='admin' WHERE id='req'")
  assert.equal((await studioCockpit(db, [], '2099-03-05')).items.some(item => item.id === 'req'), false)
  await assert.rejects(qualifyStudioRequest(db, 'admin', 'req', qualification), status(409))
  await run('DELETE FROM projects WHERE id=?', creation.projectId)
  await assert.rejects(launchStudioOnboarding(db, 'admin', payload), status(409))
  console.log('PASS tri réel, liens, qualification, report et suppression sans recréation')
} finally {
  await db?.close()
  rmSync(temporary, { recursive: true, force: true })
}
