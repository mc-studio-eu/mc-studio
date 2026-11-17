#!/usr/bin/env node
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const work = mkdtempSync(join(tmpdir(), 'mc-operations-test-'))
const dbPath = join(work, 'portal.sqlite')
const dotenvPath = join(work, 'empty.env')
const port = Number(process.env.PORTAL_OPERATIONS_TEST_PORT || 4194)
const base = 'http://127.0.0.1:' + port
const adminPath = '/api/portal/admin/operations'
const tickPath = '/api/portal/operations/tick'
const schedulerSecret = 'test-portal-operations-scheduler-0000'
const legacySecret = 'test-portal-legacy-reminder-0000'
const adminSession = 'isolated-operations-admin'
const clientSession = 'isolated-operations-client'
const now = new Date()
const day = 86_400_000
const old = new Date(now.getTime() - 10 * day).toISOString()
const hash = value => createHash('sha256').update(value).digest('hex')
let server
let db
let serverLog = ''

writeFileSync(dotenvPath, '')
const env = {
 ...process.env,
 NODE_ENV:'development',
 DATABASE_URL:'', NUXT_DATABASE_URL:'', NUXT_PORTAL_DB_PATH:dbPath,
 PORTAL_EMAIL_DISABLED:'1', NUXT_RESEND_API_KEY:'', NUXT_PUBLIC_SITE_URL:base,
 R2_ENDPOINT:'', R2_BUCKET:'', R2_ACCESS_KEY_ID:'', R2_SECRET_ACCESS_KEY:'',
 FIGMA_ACCESS_TOKEN:'', NUXT_FIGMA_ACCESS_TOKEN:'', GOOGLE_SERVICE_ACCOUNT_JSON:'',
 PORTAL_MCP_TOKEN:'', PORTAL_OPERATIONS_SECRET:schedulerSecret, PORTAL_REMINDER_SECRET:legacySecret
}

async function request(path, {method = 'GET', session, authorization, body, origin, timeout = 45_000} = {}) {
 const response = await fetch(base + path, {
  method,
  signal:AbortSignal.timeout(timeout),
  headers:{
   ...(session ? {cookie:'mc_portal_session=' + session} : {}),
   ...(authorization ? {authorization} : {}),
   ...(origin ? {origin} : {}),
   ...(body === undefined ? {} : {'content-type':'application/json'})
  },
  ...(body === undefined ? {} : {body:JSON.stringify(body)})
 })
 return {status:response.status, data:await response.json()}
}

function expect(result, status = 200) {
 assert.equal(result.status, status, JSON.stringify(result.data))
 return result.data
}

const overview = async (query = '') => expect(await request(adminPath + query, {session:adminSession}))
const admin = (body, extra = {}) => request(adminPath, {method:'POST', session:adminSession, body, ...extra})
const tick = () => request(tickPath, {method:'POST',authorization:'Bearer ' + schedulerSecret})
const launch = (scenario, key, projectId = 'project-a') => admin({action:'launch', scenario, projectId, key})
const runRow = id => db.prepare('SELECT * FROM portal_operation_runs WHERE id=?').get(id)
const noticeCount = (kind, projectId = 'project-a') => db.prepare('SELECT COUNT(*) AS n FROM portal_notifications WHERE kind=? AND project_id=?').get(kind, projectId).n

async function waitForServer() {
 const deadline = Date.now() + 90_000
 while (Date.now() < deadline) {
  if (server.exitCode !== null) throw new Error('Nuxt test process exited ' + server.exitCode)
  try {
   const initialized = await request(adminPath, {session:adminSession,timeout:3_000})
   if (initialized.status === 401) return
  } catch {}
  await new Promise(resolve => setTimeout(resolve, 300))
 }
 throw new Error('Nuxt test server did not start')
}

function seed() {
 db = new DatabaseSync(dbPath)
 db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000')
 db.exec(`
  INSERT INTO organizations(id,name) VALUES ('org-a','Client A'),('org-b','Client B');
  INSERT INTO users(id,email,name,password_hash,role,organization_id) VALUES
   ('admin','ops-admin@example.invalid','Opérations','fixture','admin',NULL),
   ('client-a','ops-a@example.invalid','Client A','fixture','client','org-a'),
   ('client-b','ops-b@example.invalid','Client B','fixture','client','org-b');
  INSERT INTO projects(id,organization_id,name,status,progress) VALUES
   ('project-a','org-a','Projet A','En cours',25),('project-b','org-b','Projet B','En cours',50);
  INSERT INTO portal_roadmap_phases(id,project_id,title,status,position) VALUES
   ('phase-a','project-a','Phase A','in_progress',0),('phase-b','project-b','Phase B','in_progress',0);
  INSERT INTO portal_notification_preferences(user_id,in_app,email,reminder_days)
   VALUES ('client-a',1,1,1),('client-b',1,1,1);
 `)
 const step = db.prepare(`
  INSERT INTO portal_roadmap_steps(id,project_id,phase_id,title,status,position,responsible_id,created_at,updated_at)
  VALUES(?,?,?,'Étape assignée','in_progress',? ,?,?,?)
 `)
 step.run('step-a','project-a','phase-a',0,'client-a',old,old)
 const session = db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)')
 const expiry = new Date(now.getTime() + day).toISOString()
 session.run(hash(adminSession),'admin',expiry)
 session.run(hash(clientSession),'client-a',expiry)
 const periodFriday = new Date(now)
 periodFriday.setUTCHours(12,0,0,0)
 periodFriday.setUTCDate(periodFriday.getUTCDate() - (periodFriday.getUTCDay() + 2) % 7)
 const activityDate = new Date(periodFriday.getTime() - 4 * day).toISOString()
 const activity = db.prepare('INSERT INTO activity(id,project_id,message,created_at) VALUES(?,?,?,?)')
 activity.run('journal-a','project-a','Livraison réelle du portail',activityDate)
 activity.run('journal-b','project-b','Journal de l’organisation B',activityDate)
 return {step}
}

try {
 const args = ['node_modules/nuxt/bin/nuxt.mjs','dev','--host','127.0.0.1','--port',String(port),'--dotenv',dotenvPath]
 server = spawn(process.execPath, args, {
  env, stdio:process.env.PORTAL_TEST_DEBUG ? 'inherit' : ['ignore','pipe','pipe']
 })
 const rememberLog = chunk => { serverLog = (serverLog + chunk.toString()).slice(-20_000) }
 server.stdout?.on('data',rememberLog)
 server.stderr?.on('data',rememberLog)
 await waitForServer()
 const {step} = seed()

 expect(await request(adminPath),401)
 expect(await request(adminPath,{session:clientSession}),403)
 expect(await admin({action:'pause',scope:'global',paused:true},{origin:'https://example.invalid'}),403)
 expect(await request(tickPath,{method:'POST',session:adminSession}),401)
 expect(await request(tickPath,{method:'POST',authorization:schedulerSecret}),401)
 const initial = await overview()
 assert.equal(initial.connections.email,'disabled')
 assert.equal(initial.connections.figma,false)
 assert.equal(initial.connections.scheduler,true)
 assert.equal(initial.connections.lastTickAt,null)
 assert.ok(!JSON.stringify(initial).includes(schedulerSecret))
 assert.ok(initial.scenarios.every(item => !item.scheduled))
 assert.equal(expect(await tick()).queued,0)
 console.log('PASS authentication and disabled scheduling defaults')

 const launches = await Promise.all([launch('reminders','same-reminder-key'),launch('reminders','same-reminder-key')])
 const [first,second] = launches.map(value => expect(value).run)
 assert.equal(first.id,second.id)
 assert.equal(runRow(first.id).status,'succeeded')
 assert.equal(runRow(first.id).attempts,1)
 assert.equal(noticeCount('roadmap_reminder'),1)
 assert.equal(noticeCount('roadmap_reminder','project-b'),0)
 const reminder = db.prepare("SELECT id,email_status FROM portal_notifications WHERE kind='roadmap_reminder'").get()
 assert.equal(reminder.email_status,'pending')
 console.log('PASS simultaneous launches deduplicate run and notification')

 expect(await admin({action:'pause',scope:'global',paused:true}))
 expect(await launch('reminders','paused-global'),409)
 assert.equal(expect(await tick()).paused,true)
 expect(await admin({action:'pause',scope:'global',paused:false}))
 expect(await admin({action:'pause',scope:'project',projectId:'project-a',paused:true}))
 assert.equal(expect(await request('/api/portal/notifications/remind', {method:'POST', authorization:'Bearer ' + legacySecret, body:{projectId:'project-a'}})).skipped,1)
 expect(await admin({action:'pause',scope:'project',projectId:'project-a',paused:false}))
 expect(await admin({action:'pause',scope:'scenario',scenario:'reminders',paused:true}))
 expect(await launch('reminders','paused-scenario'),409)
 expect(await admin({action:'pause',scope:'scenario',scenario:'reminders',paused:false}))
 db.prepare("UPDATE portal_roadmap_steps SET status='done' WHERE id='step-a'").run()
 expect(await tick())
 const cancelled = db.prepare('SELECT email_status,visible FROM portal_notifications WHERE id=?').get(reminder.id)
 assert.equal(cancelled.email_status,'cancelled')
 assert.equal(cancelled.visible,0)
 console.log('PASS pause scopes and cancellation of a resolved action before dispatch')

 const draft = expect(await launch('weekly_report','draft-weekly')).run
 assert.equal(draft.status,'draft')
 assert.match(draft.report.body,/Livraison réelle du portail/)
 assert.doesNotMatch(draft.report.body,/organisation B/)
 assert.match(draft.report.body,/25 %/)
 assert.equal(new Date(draft.report.end).getUTCDay(),5)
 assert.equal(Date.parse(draft.report.end) - Date.parse(draft.report.start),7 * day)
 assert.equal(noticeCount('weekly_report'),0)
 assert.equal(expect(await launch('weekly_report','draft-repeat')).run.id,draft.id)
 expect(await admin({action:'pause',scope:'scenario',scenario:'weekly_report',paused:true}))
 expect(await admin({action:'approve',runId:draft.id}),409)
 expect(await admin({action:'pause',scope:'scenario',scenario:'weekly_report',paused:false}))
 const approvals = await Promise.all([admin({action:'approve',runId:draft.id}),admin({action:'approve',runId:draft.id})])
 assert.ok(approvals.every(result => expect(result).run.status === 'approved'))
 assert.equal(noticeCount('weekly_report'),1)
 assert.equal(noticeCount('weekly_report','project-b'),0)
 console.log('PASS project-sourced drafts require approval and send no cross-project notification')

 step.run('step-retry','project-b','phase-b',0,'client-b',old,old)
 db.exec(`
  CREATE TRIGGER fail_operation_fixture BEFORE UPDATE ON portal_operation_runs
  WHEN NEW.project_id='project-b' AND NEW.status='succeeded'
  BEGIN SELECT RAISE(ABORT,'synthetic failure without effects'); END;
 `)
 const failure = expect(await launch('reminders','forced-retry-key','project-b')).run
 assert.equal(failure.status,'queued')
 assert.equal(failure.attempts,1)
 assert.equal(noticeCount('roadmap_reminder','project-b'),0)
 assert.equal(expect(await admin({action:'execute',runId:failure.id})).run.attempts,1)
 for (const attempt of [2,3]) {
  db.prepare('UPDATE portal_operation_runs SET available_at=? WHERE id=?').run(old,failure.id)
  const result = expect(await admin({action:'execute',runId:failure.id})).run
  assert.equal(result.attempts,attempt)
  assert.equal(result.status,attempt === 3 ? 'failed' : 'queued')
 }
 assert.equal(noticeCount('roadmap_reminder','project-b'),0)
 db.exec('DROP TRIGGER fail_operation_fixture')
 const replays = await Promise.all([admin({action:'replay',runId:failure.id}),admin({action:'replay',runId:failure.id})])
 const [replayed,duplicate] = replays.map(value => expect(value).run)
 assert.equal(replayed.id,duplicate.id)
 assert.equal(replayed.replayOf,failure.id)
 assert.equal(runRow(replayed.id).status,'succeeded')
 assert.equal(noticeCount('roadmap_reminder','project-b'),1)
 console.log('PASS bounded retry, transactional rollback and idempotent replay')

 const interrupted = db.prepare(`
  INSERT INTO portal_operation_runs(id,project_id,scenario,idempotency_key,source,status,attempts,available_at,claim_token,lease_until,created_at,updated_at)
  VALUES(?, 'project-a', 'reminders', ?, 'manual', 'running', ?, ?, 'expired-claim', ?, ?, ?)
 `)
 for (const attempts of [2,3]) {
  const id = 'lease-fixture-' + attempts
  interrupted.run(id,id,attempts,old,old,old,old)
 }
 assert.equal(expect(await tick()).recovered,2)
 assert.equal(runRow('lease-fixture-2').status,'queued')
 assert.equal(runRow('lease-fixture-3').status,'failed')
 assert.equal(runRow('lease-fixture-3').error_code,'lease_expired')
 expect(await admin({action:'schedule',scenario:'weekly_report',scheduled:true}))
 const ticks = await Promise.all([tick(),tick()])
 assert.equal(ticks.reduce((total,result) => total + expect(result).queued,0),1)
 assert.equal(db.prepare("SELECT COUNT(*) AS n FROM portal_operation_runs WHERE scenario='weekly_report' AND source='scheduled'").get().n,1)
 const final = await overview('?projectId=project-b')
 assert.equal(final.projects.length,1)
 assert.ok(final.runs.every(run => run.projectId === 'project-b'))
 assert.ok(final.connections.lastTickAt)
 assert.equal(final.connections.transport.sent,0)
 console.log('PASS expired leases, concurrent scheduling and scoped overview')
} catch (error) {
 if (serverLog) console.error(serverLog.trimEnd())
 throw error
} finally {
 db?.close()
 if (server && server.exitCode === null) {
  server.kill('SIGTERM')
  const exited = new Promise(resolve => server.once('exit',resolve))
  const timeout = new Promise(resolve => {
   const timer = setTimeout(resolve, 5_000)
   timer.unref()
  })
  await Promise.race([exited,timeout])
  if (server.exitCode === null) {
   server.kill('SIGKILL')
   await exited
  }
 }
 rmSync(work,{recursive:true,force:true})
}
