#!/usr/bin/env node
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHash, randomBytes, scryptSync, randomUUID } from 'node:crypto'
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

// Run with `node scripts/test-portal-workflows.mjs` from the repository root.
// The isolated Nuxt server defaults to 127.0.0.1:4179; override PORTAL_TEST_PORT if needed.
// The script always creates a temporary SQLite database and disables outbound email.
const root = process.cwd()
const work = mkdtempSync(join(tmpdir(), 'mc-portal-workflows-'))
const dbPath = join(work, 'portal.sqlite')
const dotenvPath = join(work, 'empty.env')
const port = Number(process.env.PORTAL_TEST_PORT || 4179)
const baseUrl = `http://127.0.0.1:${port}`
writeFileSync(dotenvPath, '')
chmodSync(work, 0o700)

const env = {
  ...process.env,
  DATABASE_URL: '',
  NUXT_DATABASE_URL: '',
  R2_ENDPOINT: '',
  R2_BUCKET: '',
  R2_ACCESS_KEY_ID: '',
  R2_SECRET_ACCESS_KEY: '',
  NUXT_PORTAL_DB_PATH: dbPath,
  NUXT_RESEND_API_KEY: '',
  PORTAL_EMAIL_DISABLED: '1',
  PORTAL_REMINDER_SECRET: 'portal-test-reminder-secret',
  NUXT_PUBLIC_SITE_URL: baseUrl,
  NODE_ENV: 'development'
}
let server
let db
let passed = 0

function hash(value) { return createHash('sha256').update(value).digest('hex') }
function passwordHash(password) {
  const salt = randomBytes(16).toString('hex')
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`
}
function test(name, fn) {
  return Promise.resolve().then(fn).then(() => {
    passed++
    console.log(`PASS ${name}`)
  }, error => {
    console.error(`FAIL ${name}: ${error?.message || error}`)
    throw error
  })
}
async function waitForServer() {
  const deadline = Date.now() + 90_000
  while (Date.now() < deadline) {
    if (server?.exitCode !== null && server?.exitCode !== undefined) {
      throw new Error(`Nuxt dev server exited with code ${server.exitCode}`)
    }
    try {
      const response = await fetch(`${baseUrl}/api/portal/auth/me`)
      if (response.ok) return
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  throw new Error('Timed out waiting for Nuxt dev server')
}
async function request(path, { method = 'GET', body, cookie, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(cookie ? { cookie: `mc_portal_session=${cookie}` } : {}),
      ...headers
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  })
  const text = await response.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  const cookieHeader = response.headers.getSetCookie?.().find(value => value.startsWith('mc_portal_session='))
  const session = cookieHeader?.match(/^mc_portal_session=([^;]+)/)?.[1]
  return { status: response.status, data, session, headers: response.headers }
}
function expectStatus(result, status, hint = '') {
  assert.equal(result.status, status, `${hint} expected HTTP ${status}, got ${result.status}: ${JSON.stringify(result.data)}`)
}
function seed() {
  db = new DatabaseSync(dbPath)
  db.exec('PRAGMA foreign_keys=ON')
  const insertOrg = db.prepare('INSERT INTO organizations(id,name) VALUES(?,?)')
  insertOrg.run('org-a', 'Organisation A')
  insertOrg.run('org-b', 'Organisation B')
  const insertUser = db.prepare('INSERT INTO users(id,email,name,password_hash,role,organization_id) VALUES(?,?,?,?,?,?)')
  const defaultPassword = 'Portal-test-Password-2026!'
  for (const [id, email, name, role, org] of [
    ['admin', 'admin@test.invalid', 'Administrateur test', 'admin', null],
    ['decider', 'decider@test.invalid', 'Décideur test', 'client', 'org-a'],
    ['contributor', 'contributor@test.invalid', 'Contributeur test', 'client', 'org-a'],
    ['viewer', 'viewer@test.invalid', 'Lecteur test', 'client', 'org-a'],
    ['other-org', 'other@test.invalid', 'Autre organisation', 'client', 'org-b']
  ]) insertUser.run(id, email, name, passwordHash(defaultPassword), role, org)
  const member = db.prepare('INSERT INTO portal_members(user_id,member_role,suspended) VALUES(?,?,0)')
  member.run('decider', 'decision_maker')
  member.run('contributor', 'contributor')
  member.run('viewer', 'viewer')
  member.run('other-org', 'decision_maker')
  db.prepare('INSERT INTO projects(id,organization_id,name,description,status,progress,due_date,current_phase) VALUES(?,?,?,?,?,?,?,?)')
    .run('project-a', 'org-a', 'Projet A', '', 'En cours', 0, '2030-01-01', 'Cadrage')
  db.prepare('INSERT INTO projects(id,organization_id,name,description,status,progress,due_date,current_phase) VALUES(?,?,?,?,?,?,?,?)')
    .run('project-b', 'org-b', 'Projet B', '', 'En cours', 0, '2030-01-01', 'Cadrage')
  db.prepare('INSERT INTO portal_project_deciders(project_id,user_id) VALUES(?,?)').run('project-a', 'decider')
  db.prepare(`INSERT INTO resources(id,project_id,kind,title,created_by)
    VALUES('mockup-a','project-a','mockup','Maquette A','admin')`).run()
  db.prepare(`INSERT INTO resources(id,project_id,kind,title,status,created_by)
    VALUES('mockup-versioned','project-a','mockup','Maquette versionnée','pending','admin')`).run()
  db.prepare(`INSERT INTO mockup_versions(id,resource_id,number,file_key,source_version,published_by,created_at)
    VALUES('version-a','mockup-versioned',1,'synthetic-figma-key','1','admin',?)`).run(new Date().toISOString())
  return { defaultPassword }
}
async function login(email, password = 'Portal-test-Password-2026!') {
  const result = await request('/api/portal/auth/login', { method: 'POST', body: { email, password } })
  expectStatus(result, 200, `login ${email}`)
  assert.ok(result.session, `login ${email} should issue session cookie`)
  return result.session
}
async function run() {
  try {
    server = spawn(process.execPath, ['node_modules/nuxt/bin/nuxt.mjs', 'dev', '--host', '127.0.0.1', '--port', String(port), '--dotenv', dotenvPath], {
      cwd: root,
      env,
      stdio: 'ignore'
    })
    await waitForServer()
    const initialized = await request('/api/portal/auth/login', { method: 'POST', body: { email: 'schema-init@test.invalid', password: 'not-a-real-password' } })
    expectStatus(initialized, 401, 'initialize the isolated portal schema')
    seed()

    const admin = await login('admin@test.invalid')
    const decider = await login('decider@test.invalid')
    let contributor = await login('contributor@test.invalid')
    const viewer = await login('viewer@test.invalid')
    const outsider = await login('other@test.invalid')

    await test('asset folders persist per project and accept uploads only into that project’s folders', async () => {
      const createFolder = (cookie, projectId, label, headers = {}) => request('/api/portal/assets/folders', {
        method: 'POST', cookie, body: { projectId, label }, headers
      })
      expectStatus(await createFolder(undefined, 'project-a', 'Illustrations'), 401, 'anonymous folder creation')
      expectStatus(await createFolder(contributor, 'project-a', 'Illustrations'), 403, 'client folder creation')
      expectStatus(await createFolder(viewer, 'project-a', 'Illustrations'), 403, 'viewer folder creation')
      expectStatus(await createFolder(admin, 'missing-project', 'Illustrations'), 404, 'folder for missing project')
      expectStatus(await createFolder(admin, 'project-a', 'Illustrations', { origin: 'https://foreign.invalid' }), 403, 'cross-origin folder creation')
      for (const label of ['', '   ', 'x'.repeat(81), 'Dossier\u0000invalide']) {
        expectStatus(await createFolder(admin, 'project-a', label), 400, 'invalid folder name')
      }
      expectStatus(await createFolder(admin, 'project-a', ' marques '), 409, 'default folder name collision')
      const created = await createFolder(admin, 'project-a', '  Illustrations  ')
      expectStatus(created, 200, 'admin creates folder')
      const folderId = created.data.id
      assert.equal(created.data.label, 'Illustrations')
      assert.equal(db.prepare('SELECT project_id,label FROM portal_asset_folders WHERE id=?').get(folderId).project_id, 'project-a')
      expectStatus(await createFolder(admin, 'project-a', 'ILLUSTRATIONS'), 409, 'case-insensitive duplicate folder')
      const concurrent = await Promise.all([createFolder(admin, 'project-a', 'Éléments'), createFolder(admin, 'project-a', 'E\u0301le\u0301ments')])
      assert.deepEqual(concurrent.map(result => result.status).sort(), [200, 409], 'equivalent Unicode names must create only one folder')
      expectStatus(await createFolder(admin, 'project-b', 'Illustrations'), 200, 'same name in another project')
      const initial = await request('/api/portal/assets?projectId=project-a', { cookie: contributor })
      expectStatus(initial, 200, 'client reads own folders')
      assert.ok(initial.data.folders.some(folder => folder.id === folderId && folder.label === 'Illustrations'))
      const foreign = await request('/api/portal/assets?projectId=project-b', { cookie: contributor })
      expectStatus(foreign, 404, 'cross-organization folder listing')
      const otherProject = await request('/api/portal/assets?projectId=project-b', { cookie: admin })
      assert.ok(!otherProject.data.folders.some(folder => folder.id === folderId), 'folder IDs are scoped to their project')
      const postAsset = async (cookie, projectId, category) => {
        const form = new FormData()
        form.set('file', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXwAAAABJRU5ErkJggg==', 'base64')], { type: 'image/png' }), 'folder-test.png')
        form.set('title', 'Illustration de test')
        form.set('category', category)
        const response = await fetch(`${baseUrl}/api/portal/assets?projectId=${projectId}`, { method: 'POST', headers: { cookie: `mc_portal_session=${cookie}` }, body: form })
        return { status: response.status, data: await response.json() }
      }
      const initAssetUpload = (cookie, projectId, category) => request('/api/portal/uploads/init', {
        method: 'POST', cookie,
        body: { projectId, kind: 'asset', clientKey: randomUUID(), fileName: 'folder-test.png', fileSize: 100, mimeType: 'image/png', title: 'Illustration de test', category }
      })
      expectStatus(await initAssetUpload(contributor, 'project-a', folderId), 403, 'client cannot initialize asset uploads')
      expectStatus(await initAssetUpload(admin, 'project-b', folderId), 400, 'upload initialization rejects another project’s folder')
      expectStatus(await initAssetUpload(admin, 'project-a', 'unknown-folder'), 400, 'upload initialization rejects nonexistent folders')
      expectStatus(await initAssetUpload(admin, 'project-a', folderId), 200, 'upload initialization accepts a custom folder')
      expectStatus(await initAssetUpload(admin, 'project-a', 'applications'), 200, 'upload initialization accepts default folders')
      expectStatus(await postAsset(contributor, 'project-a', folderId), 403, 'client cannot upload assets')
      expectStatus(await postAsset(admin, 'project-b', folderId), 400, 'another project cannot use the folder')
      expectStatus(await postAsset(admin, 'project-a', 'unknown-folder'), 400, 'nonexistent upload folder')
      const customUpload = await postAsset(admin, 'project-a', folderId)
      expectStatus(customUpload, 200, 'upload into custom folder')
      expectStatus(await postAsset(admin, 'project-a', 'applications'), 200, 'default folders stay compatible')
      const reloaded = await request('/api/portal/assets?projectId=project-a', { cookie: contributor })
      assert.ok(reloaded.data.folders.some(folder => folder.id === folderId), 'folder survives a fresh request')
      assert.ok(reloaded.data.assets.some(asset => asset.id === customUpload.data.id && asset.category === folderId))
      const download = await fetch(`${baseUrl}/api/portal/assets/${customUpload.data.id}`, { headers: { cookie: `mc_portal_session=${contributor}` } })
      assert.equal(download.status, 200, 'client can download an asset from its custom folder')
      const deniedDownload = await fetch(`${baseUrl}/api/portal/assets/${customUpload.data.id}`, { headers: { cookie: `mc_portal_session=${outsider}` } })
      assert.equal(deniedDownload.status, 404, 'foreign organization cannot download custom-folder assets')
    })

    await test('new requests support organization-scoped creation, replies, status changes, and validation', async () => {
      const created = await request('/api/portal/requests', {
        method: 'POST', cookie: contributor,
        body: { projectId: 'project-a', title: 'Clarifier le périmètre', body: 'Pouvez-vous préciser les livrables attendus ?' }
      })
      expectStatus(created, 200, 'contributor creates a request')
      const requestId = created.data.id
      assert.ok(requestId)
      assert.ok(db.prepare("SELECT 1 FROM portal_notifications WHERE user_id='admin' AND project_id='project-a' AND kind='request_created'").get(), 'request creation should persist an in-app notification for the admin')
      expectStatus(await request('/api/portal/requests', { method: 'POST', cookie: viewer, body: { projectId: 'project-a', title: 'Demande lecteur', body: 'Interdite' } }), 403, 'reader cannot create a request')

      const list = await request('/api/portal/requests?projectId=project-a', { cookie: contributor })
      expectStatus(list, 200, 'organization request list')
      assert.ok(list.data.requests.some(item => item.id === requestId && item.authorId === 'contributor'))
      assert.equal(list.data.permissions.canCreate, true)
      const readerList = await request('/api/portal/requests?projectId=project-a', { cookie: viewer })
      expectStatus(readerList, 200, 'reader request list')
      assert.equal(readerList.data.permissions.canCreate, false)
      const foreignList = await request('/api/portal/requests?projectId=project-b', { cookie: contributor })
      expectStatus(foreignList, 404, 'cross-organization request list')

      const initial = await request(`/api/portal/requests/${requestId}`, { cookie: contributor })
      expectStatus(initial, 200, 'request detail')
      assert.equal(initial.data.request.id, requestId)
      assert.equal(initial.data.request.status, 'open')
      assert.equal(initial.data.permissions.canReply, true)
      expectStatus(await request(`/api/portal/requests/${requestId}`, { cookie: outsider }), 404, 'cross-organization request detail')

      expectStatus(await request(`/api/portal/requests/${requestId}/messages`, { method: 'POST', cookie: viewer, body: { body: 'Réponse interdite' } }), 403, 'reader reply denied')
      expectStatus(await request(`/api/portal/requests/${requestId}`, { method: 'PATCH', cookie: viewer, body: { status: 'resolved' } }), 403, 'reader status change denied')
      expectStatus(await request(`/api/portal/requests/${requestId}/messages`, { method: 'POST', cookie: outsider, body: { body: 'Réponse hors organisation' } }), 404, 'cross-organization reply')
      expectStatus(await request(`/api/portal/requests/${requestId}`, { method: 'PATCH', cookie: outsider, body: { status: 'resolved' } }), 404, 'cross-organization status change')

      expectStatus(await request(`/api/portal/requests/${requestId}/messages`, { method: 'POST', cookie: contributor, body: { body: 'Voici une précision côté client.' } }), 200, 'client reply')
      expectStatus(await request(`/api/portal/requests/${requestId}/messages`, { method: 'POST', cookie: admin, body: { body: 'Nous allons confirmer les livrables.' } }), 200, 'admin reply')
      assert.ok(db.prepare("SELECT 1 FROM portal_notifications WHERE user_id='admin' AND project_id='project-a' AND kind='request_reply'").get(), 'client reply should persist an in-app notification for the admin')
      assert.ok(db.prepare("SELECT 1 FROM portal_notifications WHERE user_id='contributor' AND project_id='project-a' AND kind='request_reply'").get(), 'admin reply should persist an in-app notification for the client')
      const replied = await request(`/api/portal/requests/${requestId}`, { cookie: decider })
      expectStatus(replied, 200)
      assert.equal(replied.data.messages.filter(item => item.type === 'reply').length, 2)
      assert.ok(replied.data.messages.some(item => item.authorId === 'contributor' && item.body === 'Voici une précision côté client.'))
      assert.ok(replied.data.messages.some(item => item.authorId === 'admin' && item.body === 'Nous allons confirmer les livrables.'))

      expectStatus(await request(`/api/portal/requests/${requestId}`, { method: 'PATCH', cookie: decider, body: { status: 'resolved' } }), 403, 'non-author member cannot resolve')
      expectStatus(await request(`/api/portal/requests/${requestId}`, { method: 'PATCH', cookie: admin, body: { status: 'resolved' } }), 200, 'admin resolves request')
      const resolved = await request(`/api/portal/requests/${requestId}`, { cookie: contributor })
      assert.equal(resolved.data.request.status, 'resolved')
      assert.ok(resolved.data.request.resolvedAt)
      assert.ok(resolved.data.messages.some(item => item.type === 'status' && item.status === 'resolved'))
      assert.ok(db.prepare("SELECT 1 FROM portal_notifications WHERE user_id='contributor' AND project_id='project-a' AND kind='request_status'").get(), 'status change should persist an in-app notification for the client')
      expectStatus(await request(`/api/portal/requests/${requestId}`, { method: 'PATCH', cookie: viewer, body: { status: 'open' } }), 403, 'reader cannot reopen')
      expectStatus(await request(`/api/portal/requests/${requestId}`, { method: 'PATCH', cookie: decider, body: { status: 'open' } }), 403, 'other member cannot reopen')
      expectStatus(await request(`/api/portal/requests/${requestId}`, { method: 'PATCH', cookie: contributor, body: { status: 'open' } }), 200, 'author reopens request')
      assert.equal((await request(`/api/portal/requests/${requestId}`, { cookie: contributor })).data.request.status, 'open')
      expectStatus(await request(`/api/portal/requests/${requestId}`, { method: 'PATCH', cookie: admin, body: { status: 'resolved' } }), 200, 'admin resolves after reopening')

      const overlong = 'x'.repeat(10_001)
      for (const body of [
        { projectId: 'project-a', title: '', body: 'Description valide' },
        { projectId: 'project-a', title: 'Titre sans description', body: '   ' },
        { projectId: 'project-a', title: 'x'.repeat(161), body: 'Description valide' },
        { projectId: 'project-a', title: 'Description trop longue', body: overlong }
      ]) expectStatus(await request('/api/portal/requests', { method: 'POST', cookie: contributor, body }), 400, 'invalid request input')
      expectStatus(await request(`/api/portal/requests/${requestId}/messages`, { method: 'POST', cookie: contributor, body: { body: '  ' } }), 400, 'empty reply')
      expectStatus(await request(`/api/portal/requests/${requestId}/messages`, { method: 'POST', cookie: contributor, body: { body: overlong } }), 400, 'overlong reply')
      expectStatus(await request(`/api/portal/requests/${requestId}`, { method: 'PATCH', cookie: admin, body: { status: 'closed' } }), 400, 'invalid status')
      expectStatus(await request(`/api/portal/requests/${requestId}`, { method: 'PATCH', cookie: admin, body: { status: 'open' } }), 200, 'admin reopens request')
      expectStatus(await request(`/api/portal/requests/${requestId}`, { method: 'PATCH', cookie: contributor, body: { status: 'resolved' } }), 200, 'author resolves request')
      assert.equal((await request(`/api/portal/requests/${requestId}`, { cookie: contributor })).data.request.status, 'resolved')

      await request('/api/portal/admin/members/contributor', { method: 'PATCH', cookie: admin, body: { suspended: true } }).then(result => expectStatus(result, 200, 'suspend request author'))
      expectStatus(await request(`/api/portal/requests/${requestId}`, { cookie: contributor }), 401, 'suspended author cannot read requests')
      const suspendedMe = await request('/api/portal/auth/me', { cookie: contributor })
      expectStatus(suspendedMe, 200)
      assert.equal(suspendedMe.data.user, null)
      expectStatus(await request('/api/portal/auth/login', { method: 'POST', body: { email: 'contributor@test.invalid', password: 'Portal-test-Password-2026!' } }), 401, 'suspended contributor login')
      expectStatus(await request('/api/portal/admin/members/contributor', { method: 'PATCH', cookie: admin, body: { suspended: false } }), 200, 'unsuspend request author')
      contributor = await login('contributor@test.invalid')

      // Keep the later notification-preference workflow's seeded unread count deterministic.
      db.prepare("DELETE FROM portal_notifications WHERE project_id='project-a' AND kind IN ('request_created','request_reply','request_status')").run()
    })

    await test('client project access stays within its organization', async () => {
      const own = await request('/api/portal/client/project?projectId=project-a', { cookie: decider })
      expectStatus(own, 200)
      assert.equal(own.data.project.id, 'project-a')
      const foreign = await request('/api/portal/client/project?projectId=project-b', { cookie: decider })
      expectStatus(foreign, 404)
      const resourceForeign = await request('/api/portal/resources?projectId=project-b', { cookie: decider })
      expectStatus(resourceForeign, 404)
    })

    await test('reader, contributor and designated decision maker have distinct review rights', async () => {
      const project = await request('/api/portal/client/project?projectId=project-a', { cookie: contributor })
      expectStatus(project, 200)
      assert.equal(project.data.permissions.canContribute, true)
      assert.equal(project.data.permissions.canReview, false)
      const readOnly = await request('/api/portal/client/project?projectId=project-a', { cookie: viewer })
      expectStatus(readOnly, 200)
      assert.equal(readOnly.data.permissions.canContribute, false)
      assert.equal(readOnly.data.permissions.canReview, false)
      const denyContributorReview = await request('/api/portal/client/review', { method: 'POST', cookie: contributor, body: { projectId: 'project-a', resourceId: 'mockup-a', state: 'approved' } })
      expectStatus(denyContributorReview, 403)
      const denyReaderReview = await request('/api/portal/client/review', { method: 'POST', cookie: viewer, body: { projectId: 'project-a', resourceId: 'mockup-a', state: 'approved' } })
      expectStatus(denyReaderReview, 403)
      const allowDeciderReview = await request('/api/portal/client/review', { method: 'POST', cookie: decider, body: { projectId: 'project-a', resourceId: 'mockup-a', state: 'approved' } })
      expectStatus(allowDeciderReview, 200)
    })

    await test('only the designated decision maker can review the latest mockup version', async () => {
      const contributorReview = await request('/api/portal/mockups/review', { method: 'POST', cookie: contributor, body: { projectId: 'project-a', versionId: 'version-a', state: 'approved' } })
      expectStatus(contributorReview, 403)
      const readerReview = await request('/api/portal/mockups/review', { method: 'POST', cookie: viewer, body: { projectId: 'project-a', versionId: 'version-a', state: 'approved' } })
      expectStatus(readerReview, 403)
      const decision = await request('/api/portal/mockups/review', { method: 'POST', cookie: decider, body: { projectId: 'project-a', versionId: 'version-a', state: 'approved' } })
      expectStatus(decision, 200)
      assert.equal(db.prepare('SELECT state,reviewed_by FROM mockup_versions WHERE id=?').get('version-a').state, 'approved')
      const resources = await request('/api/portal/resources?projectId=project-a', { cookie: decider })
      assert.ok(resources.data.reviewHistory.some(item => item.versionId === 'version-a' && item.authorId === 'decider'))
    })

    await test('suspension revokes active sessions and blocks a fresh login', async () => {
      expectStatus(await request('/api/portal/admin/members/contributor', { method: 'PATCH', cookie: admin, body: { suspended: true } }), 200)
      const me = await request('/api/portal/auth/me', { cookie: contributor })
      expectStatus(me, 200)
      assert.equal(me.data.user, null)
      expectStatus(await request('/api/portal/auth/login', { method: 'POST', body: { email: 'contributor@test.invalid', password: 'Portal-test-Password-2026!' } }), 401)
      assert.equal(db.prepare('SELECT COUNT(*) AS n FROM sessions WHERE user_id=?').get('contributor').n, 0)
      expectStatus(await request('/api/portal/admin/members/contributor', { method: 'PATCH', cookie: admin, body: { suspended: false } }), 200)
      contributor = await login('contributor@test.invalid')
    })

    await test('member role updates validate input and are admin-only', async () => {
      expectStatus(await request('/api/portal/admin/members/contributor', { method: 'PATCH', cookie: contributor, body: { memberRole: 'viewer' } }), 403)
      expectStatus(await request('/api/portal/admin/members/contributor', { method: 'PATCH', cookie: admin, body: { memberRole: 'owner' } }), 400)
      expectStatus(await request('/api/portal/admin/members/contributor', { method: 'PATCH', cookie: admin, body: { memberRole: 'viewer' } }), 200)
      const result = await request('/api/portal/client/project?projectId=project-a', { cookie: await login('contributor@test.invalid') })
      expectStatus(result, 200)
      assert.equal(result.data.permissions.canContribute, false)
      expectStatus(await request('/api/portal/admin/members/contributor', { method: 'PATCH', cookie: admin, body: { memberRole: 'contributor' } }), 200)
    })

    await test('password reset is generic, one-time, expires, and revokes sessions', async () => {
      const unknown = await request('/api/portal/auth/forgot-password', { method: 'POST', body: { email: 'absent@test.invalid' } })
      const known = await request('/api/portal/auth/forgot-password', { method: 'POST', body: { email: 'other@test.invalid' } })
      expectStatus(unknown, 200)
      expectStatus(known, 200)
      assert.deepEqual(unknown.data, known.data)
      assert.equal(known.data.ok, true)

      const token = 'synthetic-one-time-reset-token'
      db.prepare('INSERT INTO portal_password_resets(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)')
        .run(hash(token), 'other-org', new Date(Date.now() + 60_000).toISOString(), new Date().toISOString())
      const reset = await request('/api/portal/auth/reset-password', { method: 'POST', body: { token, password: 'Portal-new-Password-2026!' } })
      expectStatus(reset, 200)
      expectStatus(await request('/api/portal/auth/me', { cookie: outsider }), 200)
      assert.equal((await request('/api/portal/auth/me', { cookie: outsider })).data.user, null)
      assert.equal(db.prepare('SELECT COUNT(*) AS n FROM sessions WHERE user_id=?').get('other-org').n, 0)
      expectStatus(await request('/api/portal/auth/reset-password', { method: 'POST', body: { token, password: 'Portal-new-Password-2026!' } }), 410)
      expectStatus(await request('/api/portal/auth/login', { method: 'POST', body: { email: 'other@test.invalid', password: 'Portal-test-Password-2026!' } }), 401)
      assert.ok(await login('other@test.invalid', 'Portal-new-Password-2026!'))

      const expired = 'synthetic-expired-reset-token'
      db.prepare('INSERT INTO portal_password_resets(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)')
        .run(hash(expired), 'other-org', new Date(Date.now() - 60_000).toISOString(), new Date(Date.now() - 120_000).toISOString())
      expectStatus(await request('/api/portal/auth/reset-password', { method: 'POST', body: { token: expired, password: 'Portal-another-Password-2026!' } }), 410)
    })

    await test('account password change invalidates every active session', async () => {
      const freshViewer = await login('viewer@test.invalid')
      const result = await request('/api/portal/auth/change-password', { method: 'POST', cookie: freshViewer, body: { currentPassword: 'Portal-test-Password-2026!', password: 'Portal-viewer-Password-2026!' } })
      expectStatus(result, 200)
      assert.equal(db.prepare('SELECT COUNT(*) AS n FROM sessions WHERE user_id=?').get('viewer').n, 0)
      assert.equal((await request('/api/portal/auth/me', { cookie: viewer })).data.user, null)
      assert.ok(await login('viewer@test.invalid', 'Portal-viewer-Password-2026!'))
    })

    let milestoneId
    await test('checklist milestones enforce validation, assignment, and responsible-user updates', async () => {
      expectStatus(await request('/api/portal/milestones', { method: 'POST', cookie: contributor, body: { projectId: 'project-a', title: 'Checklist indisponible' } }), 403)
      const checklist = await request('/api/portal/milestones', { method: 'POST', cookie: admin, body: { projectId: 'project-a', title: 'Checklist test', description: 'Étapes vérifiables', kind: 'checklist', status: 'todo', dueDate: '2030-01-01', responsibleId: 'contributor' } })
      expectStatus(checklist, 200)
      const created = await request('/api/portal/milestones', { method: 'POST', cookie: admin, body: { projectId: 'project-a', title: 'Jalon assigné', kind: 'milestone', dueDate: '2030-01-01', responsibleId: 'contributor' } })
      expectStatus(created, 200)
      milestoneId = created.data.id
      assert.ok(milestoneId)
      expectStatus(await request('/api/portal/milestones', { method: 'POST', cookie: admin, body: { projectId: 'project-a', title: 'Date invalide', dueDate: '2030-02-30' } }), 400)
      expectStatus(await request('/api/portal/milestones', { method: 'POST', cookie: admin, body: { projectId: 'project-a', title: 'Mauvais responsable', responsibleId: 'other-org' } }), 400)
      expectStatus(await request(`/api/portal/milestones/${milestoneId}`, { method: 'PATCH', cookie: decider, body: { status: 'done' } }), 403)
      expectStatus(await request(`/api/portal/milestones/${milestoneId}`, { method: 'PATCH', cookie: contributor, body: { status: 'in_progress', blocker: 'Validation en cours' } }), 200)
      const list = await request('/api/portal/resources?projectId=project-a', { cookie: contributor })
      expectStatus(list, 200)
      assert.ok(list.data.milestones.some(item => item.id === checklist.data.id && item.kind === 'checklist'))
      assert.ok(list.data.milestones.some(item => item.id === milestoneId && item.status === 'in_progress'))
      assert.ok(list.data.todos.some(item => item.id === milestoneId && item.responsibleId === 'contributor'))
      expectStatus(await request(`/api/portal/milestones/${milestoneId}`, { method: 'PATCH', cookie: contributor, body: { title: 'Modification interdite' } }), 403)
      expectStatus(await request(`/api/portal/milestones/${milestoneId}`, { method: 'DELETE', cookie: contributor }), 403)
      expectStatus(await request(`/api/portal/milestones/${milestoneId}`, { method: 'DELETE', cookie: admin }), 200)
    })

    await test('a client file upload fulfills its assigned request and removes the todo', async () => {
      const created = await request('/api/portal/files/requests', { method: 'POST', cookie: admin, body: { projectId: 'project-a', title: 'Brief de campagne', description: 'Ajouter le brief final.', responsibleId: 'contributor', dueDate: '2030-01-01' } })
      expectStatus(created, 200)
      const requestId = created.data.id
      const before = await request('/api/portal/resources?projectId=project-a', { cookie: contributor })
      assert.ok(before.data.todos.some(item => item.id === requestId && item.kind === 'file'))

      // Exercise payloads larger than the former 10 MiB cap and verify the stored bytes survive download.
      const fileBytes = randomBytes(11 * 1024 * 1024)
      const form = new FormData()
      form.set('file', new Blob([fileBytes], { type: 'application/octet-stream' }), 'brief.bin')
      form.set('requestId', requestId)
      const uploaded = await fetch(`${baseUrl}/api/portal/files?projectId=project-a`, { method: 'POST', headers: { cookie: `mc_portal_session=${contributor}` }, body: form })
      const uploadBody = await uploaded.json()
      expectStatus({ status: uploaded.status, data: uploadBody }, 200, 'client file upload')
      assert.ok(uploadBody.id)

      const downloaded = await fetch(`${baseUrl}/api/portal/files/${uploadBody.id}`, { headers: { cookie: `mc_portal_session=${contributor}` } })
      assert.equal(downloaded.status, 200, `uploaded file download expected HTTP 200, got ${downloaded.status}`)
      const downloadedBytes = Buffer.from(await downloaded.arrayBuffer())
      assert.equal(downloadedBytes.length, fileBytes.length)
      assert.equal(hash(downloadedBytes), hash(fileBytes), 'downloaded file must match the uploaded bytes')
      const freshOutsider = await login('other@test.invalid', 'Portal-new-Password-2026!')
      const hiddenFromOtherOrganization = await fetch(`${baseUrl}/api/portal/files/${uploadBody.id}`, { headers: { cookie: `mc_portal_session=${freshOutsider}` } })
      assert.equal(hiddenFromOtherOrganization.status, 404, 'another organization cannot download the uploaded file')

      const requests = await request('/api/portal/files/requests?projectId=project-a', { cookie: admin })
      const fulfilled = requests.data.requests.find(item => item.id === requestId)
      assert.equal(fulfilled.status, 'fulfilled')
      assert.equal(fulfilled.uploadedBy, 'Contributeur test')
      assert.equal(fulfilled.fileName, 'brief.bin')
      const after = await request('/api/portal/resources?projectId=project-a', { cookie: contributor })
      assert.ok(!after.data.todos.some(item => item.id === requestId))
    })

    await test('file uploads enforce size, empty-file, role, organization, and request-conflict rules', async () => {
      const activeViewer = await login('viewer@test.invalid', 'Portal-viewer-Password-2026!')
      const postFile = async (cookie, projectId, bytes, filename = 'test.bin', requestId = '') => {
        const form = new FormData()
        form.set('file', new Blob([bytes], { type: 'application/octet-stream' }), filename)
        if (requestId) form.set('requestId', requestId)
        return fetch(`${baseUrl}/api/portal/files?projectId=${projectId}`, {
          method: 'POST', headers: { cookie: `mc_portal_session=${cookie}` }, body: form
        })
      }

      const tooLarge = await postFile(contributor, 'project-a', Buffer.alloc(50 * 1024 * 1024 + 1), 'over-limit.bin')
      assert.equal(tooLarge.status, 413, `file over 50 MiB should return 413, got ${tooLarge.status}`)
      const maxBytes = Buffer.alloc(50 * 1024 * 1024, 0x5a)
      const maxUploadResponse = await postFile(contributor, 'project-a', maxBytes, 'limite-épreuve.bin')
      const maxUpload = await maxUploadResponse.json()
      expectStatus({ status: maxUploadResponse.status, data: maxUpload }, 200, 'file exactly at 50 MiB limit')
      try {
        const maxDownload = await fetch(`${baseUrl}/api/portal/files/${maxUpload.id}`, { headers: { cookie: `mc_portal_session=${contributor}` } })
        assert.equal(maxDownload.status, 200, `50 MiB file download expected HTTP 200, got ${maxDownload.status}`)
        const maxDownloadedBytes = Buffer.from(await maxDownload.arrayBuffer())
        assert.equal(maxDownloadedBytes.length, maxBytes.length)
        assert.equal(hash(maxDownloadedBytes), hash(maxBytes), '50 MiB download must match the uploaded bytes')
        assert.match(maxDownload.headers.get('content-disposition') || '', /limite-%C3%A9preuve\.bin/i, 'download filename should preserve UTF-8')
      } finally {
        if (maxUpload.id) expectStatus(await request(`/api/portal/files/${maxUpload.id}`, { method: 'DELETE', cookie: admin }), 200, 'remove exact-limit test file')
      }
      const empty = await postFile(contributor, 'project-a', Buffer.alloc(0), 'empty.txt')
      assert.equal(empty.status, 400, `empty file should return 400, got ${empty.status}`)
      const reader = await postFile(activeViewer, 'project-a', Buffer.from('reader'), 'reader.txt')
      assert.equal(reader.status, 403, `viewer upload should return 403, got ${reader.status}`)
      const foreignProject = await postFile(contributor, 'project-b', Buffer.from('foreign'), 'foreign.txt')
      assert.equal(foreignProject.status, 404, `cross-organization upload should return 404, got ${foreignProject.status}`)

      const requested = await request('/api/portal/files/requests', {
        method: 'POST', cookie: admin,
        body: { projectId: 'project-a', title: 'Un seul fichier', description: '', responsibleId: 'contributor' }
      })
      expectStatus(requested, 200)
      const requestId = requested.data.id
      const race = await Promise.all([
        postFile(contributor, 'project-a', Buffer.from('first'), 'first.txt', requestId),
        postFile(contributor, 'project-a', Buffer.from('second'), 'second.txt', requestId)
      ])
      const statuses = race.map(response => response.status).sort((a, b) => a - b)
      assert.deepEqual(statuses, [200, 409], `only one upload may fulfill a request, got HTTP ${statuses.join(', ')}`)

      // Seed only the aggregate size to exercise quota rejection without storing a 500 MiB fixture.
      db.prepare(`INSERT INTO resources(id,project_id,kind,title,file_name,file_size,created_by)
        VALUES(?,?,?,?,?,?,?)`).run('quota-fixture', 'project-a', 'file', 'Quota fixture', 'quota.bin', 500 * 1024 * 1024, 'admin')
      try {
        const overQuota = await postFile(contributor, 'project-a', Buffer.from('x'), 'quota-test.txt')
        assert.equal(overQuota.status, 413, `project over 500 MiB quota should return 413, got ${overQuota.status}`)
      } finally {
        db.prepare('DELETE FROM resources WHERE id=?').run('quota-fixture')
      }
    })

    await test('notification preferences, read state, and reminder deduplication work', async () => {
      db.prepare('INSERT INTO portal_notifications(id,user_id,project_id,kind,title,body,created_at,visible,email_status) VALUES(?,?,?,?,?,?,?,?,?)')
        .run('notification-a', 'decider', 'project-a', 'review', 'Validation requise', 'À examiner', new Date().toISOString(), 1, 'disabled')
      const before = await request('/api/portal/notifications', { cookie: decider })
      expectStatus(before, 200)
      assert.equal(before.data.unreadCount, 1)
      assert.equal(before.data.preferences.reminderDays, 3)
      expectStatus(await request('/api/portal/notifications/preferences', { method: 'PUT', cookie: decider, body: { inApp: true, email: false, reminderDays: 1 } }), 200)
      expectStatus(await request('/api/portal/notifications/preferences', { method: 'PUT', cookie: decider, body: { inApp: true, email: false, reminderDays: 31 } }), 400)
      expectStatus(await request('/api/portal/notifications', { method: 'PATCH', cookie: decider, body: { id: 'notification-a' } }), 200)
      const after = await request('/api/portal/notifications', { cookie: decider })
      assert.equal(after.data.unreadCount, 0)
      assert.deepEqual(after.data.preferences, { inApp: true, email: false, reminderDays: 1 })

      const due = db.prepare(`INSERT INTO portal_milestones(id,project_id,title,description,kind,status,due_date,responsible_id,blocker,created_by,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`)
      const now = new Date().toISOString()
      const aged = new Date(Date.now() - 4 * 86400000).toISOString()
      due.run('reminder-item', 'project-a', 'Action à relancer', '', 'milestone', 'todo', '2030-01-01', 'contributor', '', 'admin', now, now)
      await request('/api/portal/notifications/preferences', { method: 'PUT', cookie: contributor, body: { inApp: true, email: false, reminderDays: 1 } })
      const headers = { authorization: 'Bearer portal-test-reminder-secret' }
      const tooSoon = await request('/api/portal/notifications/remind', { method: 'POST', headers, body: { projectId: 'project-a' } })
      expectStatus(tooSoon, 200)
      assert.equal(db.prepare("SELECT COUNT(*) AS n FROM portal_notifications WHERE user_id='contributor' AND kind='reminder'").get().n, 0)
      db.prepare('UPDATE portal_milestones SET created_at=?,updated_at=? WHERE id=?').run(aged, aged, 'reminder-item')

      expectStatus(await request('/api/portal/notifications/preferences', { method: 'PUT', cookie: contributor, body: { inApp: false, email: false, reminderDays: 1 } }), 200)
      const disabled = await request('/api/portal/notifications/remind', { method: 'POST', headers, body: { projectId: 'project-a' } })
      expectStatus(disabled, 200)
      assert.equal(disabled.data.queued, 0)
      assert.equal(db.prepare("SELECT COUNT(*) AS n FROM portal_notifications WHERE user_id='contributor' AND kind='reminder'").get().n, 0)

      expectStatus(await request('/api/portal/notifications/preferences', { method: 'PUT', cookie: contributor, body: { inApp: true, email: false, reminderDays: 1 } }), 200)

      const first = await request('/api/portal/notifications/remind', { method: 'POST', headers, body: { projectId: 'project-a' } })
      expectStatus(first, 200)
      assert.ok(first.data.queued >= 1)
      const reminderCount = db.prepare("SELECT COUNT(*) AS n FROM portal_notifications WHERE user_id='contributor' AND kind='reminder' AND dedupe_key LIKE 'reminder:milestone:reminder-item:%'").get().n
      const reminder = db.prepare("SELECT title,body,email_status FROM portal_notifications WHERE user_id='contributor' AND kind='reminder' AND dedupe_key LIKE 'reminder:milestone:reminder-item:%'").get()
      assert.ok(reminder)
      assert.equal(reminder.title, 'Action attendue : Action à relancer')
      assert.ok(reminder.body.includes('projet Projet A') && reminder.body.includes('2030-01-01'))
      assert.equal(reminder.body.includes('milestone:reminder-item'), false)
      assert.equal(reminder.email_status, 'disabled')
      const second = await request('/api/portal/notifications/remind', { method: 'POST', headers, body: { projectId: 'project-a' } })
      expectStatus(second, 200)
      assert.equal(db.prepare("SELECT COUNT(*) AS n FROM portal_notifications WHERE user_id='contributor' AND kind='reminder' AND dedupe_key LIKE 'reminder:milestone:reminder-item:%'").get().n, reminderCount)
      expectStatus(await request('/api/portal/notifications/remind', { method: 'POST', body: { projectId: 'project-a' } }), 401)
    })

    assert.ok(admin && outsider)
  } finally {
    db?.close()
    if (server && server.exitCode === null) {
      server.kill('SIGTERM')
      await Promise.race([new Promise(resolve => server.once('exit', resolve)), new Promise(resolve => setTimeout(resolve, 5000))])
    }
    rmSync(work, { recursive: true, force: true })
  }
  console.log(`\n${passed} workflow assertions passed.`)
}

run().catch(error => {
  console.error(error?.stack || error)
  process.exitCode = 1
})
