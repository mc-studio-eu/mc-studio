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

  assert.deepEqual(await status(), { active: null, lastStoppedSessionId: null, serverNow: startDate.toISOString() })
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

  console.log('PASS chronomètre persistant, isolation par admin, concurrence, arrêt idempotent, précision et historique')
} finally {
  mock.timers.reset()
  await db.close()
  rmSync(directory, { recursive: true, force: true })
}
