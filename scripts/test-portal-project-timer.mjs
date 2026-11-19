#!/usr/bin/env node
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mock } from 'node:test'
import { commercialMutation, commercialSnapshot } from '../server/utils/portal-commercial.ts'
import { portalDb } from '../server/utils/portal-db.ts'
import { projectTimerMutation, projectTimerStatus, readClockifySnapshot } from '../server/utils/portal-project-timer.ts'
import { clockifyWeeks } from '../shared/portal-clockify.ts'
import { portalProjectTimeSeconds, portalTimerDuration } from '../shared/portal-project-timer.ts'
import { sessionDurationSeconds, sessionParisCandidates, sessionParisTime } from '../shared/portal-time-session-editor.ts'

// Run with `node scripts/test-portal-project-timer.mjs` against a disposable SQLite database.
const directory = mkdtempSync(join(tmpdir(), 'mc-portal-project-timer-'))
process.env.DATABASE_URL = ''
process.env.NUXT_DATABASE_URL = ''
process.env.NUXT_PORTAL_DB_PATH = join(directory, 'portal.sqlite')
process.env.NODE_ENV = 'development'
const startDate = new Date('2026-10-30T23:59:30.000Z')
mock.timers.enable({ apis: ['Date'], now: startDate })

let db = await portalDb()
const start = (projectId = 'project', description = ' Maquette ', actor = 'admin') =>
  projectTimerMutation(db, { action: 'start', projectId, description }, actor)
const stop = (id, actor = 'admin') => projectTimerMutation(db, { action: 'stop', id }, actor)
const status = (actor = 'admin') => projectTimerStatus(db, actor)
const errorStatus = code => cause => cause.statusCode === code

try {
  await db.prepare("INSERT INTO organizations(id,name) VALUES('client','Client')").run()
  await db.prepare("INSERT INTO projects(id,organization_id,name) VALUES('project','client','Projet test'),('deleted','client','Projet supprimable')").run()
  await db.prepare(`INSERT INTO users(id,email,name,password_hash,role) VALUES
    ('admin','admin@example.test','Admin','unused','admin'),('other','other@example.test','Autre admin','unused','admin')`).run()

  assert.deepEqual(await status(), { active: null, lastStoppedSessionId: null, historyRevision: '', serverNow: startDate.toISOString() })
  await assert.rejects(start('unknown'), errorStatus(404))
  await assert.rejects(start('project', 'x'.repeat(161)), errorStatus(400))
  await assert.rejects(start('project', 123), errorStatus(400))
  await assert.rejects(stop('unknown'), errorStatus(404))

  const attempts = await Promise.allSettled([start(), start()])
  const started = attempts.find(result => result.status === 'fulfilled')?.value
  assert.ok(started)
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1)
  assert.equal(attempts.find(result => result.status === 'rejected').reason.statusCode, 409)
  assert.equal(started.session.startedAt, startDate.toISOString())
  assert.equal(started.session.description, 'Maquette')
  assert.equal(started.session.stoppedAt, null)
  assert.equal((await commercialSnapshot(db)).timeSessions.length, 0)

  // A second admin can track a different project without accessing or stopping the first timer.
  const other = (await start('deleted', '', 'other')).session
  assert.equal((await status('other')).active.id, other.id)
  await assert.rejects(stop(started.session.id, 'other'), errorStatus(404))

  await db.close()
  db = await portalDb()
  assert.deepEqual((await status()).active, { ...started.session })
  mock.timers.tick(42_900)
  const [stopped, repeated] = await Promise.all([stop(started.session.id), stop(started.session.id)])
  assert.deepEqual(stopped, repeated)
  assert.equal(stopped.session.durationSeconds, 42)
  assert.equal(portalTimerDuration(stopped.session.durationSeconds), '00:00:42')
  assert.equal((await status()).active, null)
  assert.equal((await status()).lastStoppedSessionId, stopped.session.id)

  // Replaying an old stop cannot affect a newer session. Sessions under one minute retain exact seconds.
  const resumed = (await start('project', stopped.session.description)).session
  assert.notEqual(resumed.id, stopped.session.id)
  assert.deepEqual((await stop(stopped.session.id)).session, stopped.session)
  assert.equal((await status()).active.id, resumed.id)
  mock.timers.tick(800)
  assert.equal((await stop(resumed.id)).session.durationSeconds, 0)

  await commercialMutation(db, { action: 'saveCost', projectId: 'project', label: 'Atelier', occurredOn: '2026-10-30', minutes: 4, costCents: 3_000 }, 'admin')
  const snapshot = await commercialSnapshot(db)
  assert.deepEqual(snapshot.timeSessions.map(item => [item.id, item.durationSeconds]), [[resumed.id, 0], [stopped.session.id, 42]])
  assert.deepEqual(snapshot.costs.map(item => [item.minutes, item.costCents]), [[4, 3_000]])
  assert.equal(portalTimerDuration(portalProjectTimeSeconds(snapshot.costs, snapshot.timeSessions)), '00:04:42')

  await db.prepare("DELETE FROM projects WHERE id='deleted'").run()
  assert.equal((await status('other')).active.projectId, null)
  const retained = (await stop(other.id, 'other')).session
  assert.equal(retained.projectId, null)
  assert.equal(retained.projectName, 'Projet supprimable')
  assert.ok((await commercialSnapshot(db)).timeSessions.some(item => item.id === retained.id))

  const clockify = await readClockifySnapshot(db)
  assert.deepEqual(clockify.clients.map(client => [client.id, client.name]), [['client', 'Client']])
  assert.deepEqual(clockify.projects.map(project => [project.id, project.organizationId]), [['project', 'client']])
  assert.ok(clockify.timeSessions.some(session => session.id === retained.id && session.projectId === null))
  assert.ok(clockify.timeSessions.some(session => session.id === stopped.session.id && session.durationSeconds === 42))

  // Sunday and Monday in Paris can be on the same UTC date, including after the switch to winter time.
  const fixture = (id, startedAt, seconds) => ({
    ...stopped.session, id, startedAt, stoppedAt: new Date(Date.parse(startedAt) + seconds * 1000).toISOString(), durationSeconds: seconds
  })
  const weeks = clockifyWeeks([
    fixture('sunday', '2026-10-25T22:45:00.000Z', 60),
    fixture('second', '2026-10-25T23:05:00.000Z', 112),
    fixture('first', '2026-10-25T23:00:00.000Z', 38),
    fixture('tuesday', '2026-10-27T12:00:00.000Z', 151),
    { ...started.session, durationSeconds: null, stoppedAt: null },
  ])
  assert.deepEqual(weeks.map(week => [week.monday, week.seconds, week.days.map(day => [day.date, day.seconds, day.sessions.map(session => session.id)])]), [
    ['2026-10-26', 301, [['2026-10-27', 151, ['tuesday']], ['2026-10-26', 150, ['second', 'first']]]],
    ['2026-10-19', 60, [['2026-10-25', 60, ['sunday']]]],
  ])

  const manualInput = { action: 'saveSession', requestId: 'manual-21-hours', projectId: 'project', description: 'Chronomètre oublié',
    startedAt: '2026-10-28T18:04:22.423Z', stoppedAt: '2026-10-29T15:04:22.823Z' }
  const manual = (await projectTimerMutation(db, manualInput, 'admin')).session
  assert.equal(manual.durationSeconds, 21 * 3600)
  assert.equal((await status()).active, null)
  const revision = (await status()).historyRevision
  assert.ok(revision)
  const expected = session => ({ projectId: session.projectId, description: session.description, startedAt: session.startedAt,
    stoppedAt: session.stoppedAt, durationSeconds: session.durationSeconds })
  const correction = { ...manualInput, id: manual.id, requestId: undefined, expected: expected(manual), stoppedAt: '2026-10-28T19:34:22.423Z' }
  const corrected = (await projectTimerMutation(db, correction, 'other')).session
  assert.equal(corrected.id, manual.id)
  assert.equal(corrected.author, 'Admin')
  assert.equal(corrected.durationSeconds, 5400)
  assert.notEqual((await status()).historyRevision, revision)
  await assert.rejects(projectTimerMutation(db, correction, 'admin'), errorStatus(409))
  const renamed = (await projectTimerMutation(db, { ...correction, expected: expected(corrected), description: 'Tâche corrigée' }, 'admin')).session
  assert.equal(renamed.startedAt, manual.startedAt)
  assert.equal(renamed.stoppedAt, corrected.stoppedAt)
  assert.equal(renamed.durationSeconds, 5400)
  const parallel = await Promise.allSettled([
    projectTimerMutation(db, { ...correction, expected: expected(renamed), description: 'Version A' }, 'admin'),
    projectTimerMutation(db, { ...correction, expected: expected(renamed), description: 'Version B' }, 'other'),
  ])
  assert.equal(parallel.filter(item => item.status === 'fulfilled').length, 1)
  assert.equal(parallel.find(item => item.status === 'rejected').reason.statusCode, 409)
  const newManual = { ...manualInput, requestId: 'manual-retry', description: 'Saisie manuelle',
    startedAt: '2026-10-28T16:00:00.000Z', stoppedAt: '2026-10-28T16:30:00.000Z' }
  const created = await Promise.all([projectTimerMutation(db, newManual, 'admin'), projectTimerMutation(db, newManual, 'admin')])
  assert.equal(created[0].session.id, created[1].session.id)
  assert.equal(created[0].session.durationSeconds, 1800)
  assert.equal((await readClockifySnapshot(db)).timeSessions.filter(session => session.id === created[0].session.id).length, 1)
  await assert.rejects(projectTimerMutation(db, { ...newManual, description: 'Autre tâche' }, 'admin'), errorStatus(409))
  await assert.rejects(projectTimerMutation(db, { ...newManual, requestId: 'no-project', projectId: 'unknown' }, 'admin'), errorStatus(404))
  await assert.rejects(projectTimerMutation(db, { ...newManual, stoppedAt: '2026-10-28T15:00:00.000Z' }, 'admin'), errorStatus(400))
  await assert.rejects(projectTimerMutation(db, { ...newManual, stoppedAt: '2027-01-01T00:00:00.000Z' }, 'admin'), errorStatus(400))
  await assert.rejects(projectTimerMutation(db, { ...newManual, startedAt: '2026-02-30T00:00:00.000Z' }, 'admin'), errorStatus(400))
  await assert.rejects(projectTimerMutation(db, { ...newManual, startedAt: '1900-01-01T00:00:00.000Z' }, 'admin'), errorStatus(400))
  const active = (await start()).session
  await assert.rejects(projectTimerMutation(db, { ...correction, id: active.id, expected: expected(active) }, 'admin'), errorStatus(409))
  assert.equal((await status()).active.id, active.id)
  await stop(active.id)
  const preserved = (await projectTimerMutation(db, { ...correction, id: retained.id, projectId: null, expected: expected(retained) }, 'admin')).session
  assert.equal(preserved.projectName, retained.projectName)
  assert.equal(preserved.projectId, null)
  const updatedSnapshot = await commercialSnapshot(db)
  const projectSessions = updatedSnapshot.timeSessions.filter(session => session.projectId === 'project')
  assert.equal(portalProjectTimeSeconds(updatedSnapshot.costs, projectSessions), 4 * 60 + 42 + 5400 + 1800)

  assert.equal(sessionParisTime('2026-10-25T00:30:00.000Z'), '2026-10-25T02:30:00')
  assert.deepEqual(sessionParisCandidates('2026-10-25T02:30'), ['2026-10-25T00:30:00.000Z', '2026-10-25T01:30:00.000Z'])
  assert.deepEqual(sessionParisCandidates('2026-03-29T02:30'), [])
  assert.deepEqual(sessionParisCandidates('2026-02-30T02:30'), [])
  assert.deepEqual(sessionParisCandidates('2026-10-30T10:30:27'), ['2026-10-30T09:30:27.000Z'])
  assert.equal(sessionDurationSeconds('01:30:00'), 5400)
  assert.equal(sessionDurationSeconds('01:90:00'), null)

  console.log('PASS chronomètre, corrections, saisie manuelle, conflits concurrents, totaux et horaires Paris')
} finally {
  mock.timers.reset()
  await db.close()
  rmSync(directory, { recursive: true, force: true })
}
