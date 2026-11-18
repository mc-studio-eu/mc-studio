#!/usr/bin/env node
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { portalDb } from '../server/utils/portal-db.ts'
import { portalFileRange } from '../server/utils/portal-file-range.ts'
import { portalFilePreview } from '../shared/portal-file-preview.ts'

assert.deepEqual(portalFilePreview('Contrat.PDF'), { kind: 'pdf', mime: 'application/pdf' })
assert.deepEqual(portalFilePreview('maquette.webp'), { kind: 'image', mime: 'image/webp' })
assert.deepEqual(portalFilePreview('démo.mp4'), { kind: 'video', mime: 'video/mp4' })
assert.deepEqual(portalFilePreview('appel.mp3'), { kind: 'audio', mime: 'audio/mpeg' })
for (const name of ['document.pdf.html', 'image.svg', 'fichier.zip', 'prototype', 'document.constructor']) {
  assert.equal(portalFilePreview(name), undefined)
}
assert.deepEqual(portalFileRange('bytes=1-3', 7), { start: 1, end: 3 })
assert.deepEqual(portalFileRange('bytes=3-', 7), { start: 3, end: 6 })
assert.deepEqual(portalFileRange('bytes=-3', 7), { start: 4, end: 6 })
assert.equal(portalFileRange('bytes=7-', 7), null)
assert.equal(portalFileRange('bytes=6-5', 7), null)
console.log('PASS formats autorisés et plages d’octets')

if (process.env.PORTAL_FILE_PREVIEW_HTTP === '1') {
  const work = mkdtempSync(join(tmpdir(), 'mc-portal-file-preview-'))
  const dotenv = join(work, 'empty.env')
  writeFileSync(dotenv, '')
  Object.assign(process.env, {
    NODE_ENV: 'development',
    DATABASE_URL: '',
    NUXT_DATABASE_URL: '',
    NUXT_PORTAL_DB_PATH: join(work, 'portal.sqlite'),
    R2_ENDPOINT: 'https://object-store.test.invalid',
    R2_BUCKET: 'preview-fixtures',
    R2_ACCESS_KEY_ID: 'test-access',
    R2_SECRET_ACCESS_KEY: 'test-secret',
    R2_DAILY_DOWNLOAD_LIMIT: '10',
    PORTAL_EMAIL_DISABLED: '1',
  })

  const port = Number(process.env.PORTAL_FILE_PREVIEW_PORT || 4196)
  const base = `http://127.0.0.1:${port}`
  const token = id => `preview-test-${id}`
  const db = await portalDb()
  let server
  let closed = false
  try {
    await db.prepare("INSERT INTO organizations(id,name) VALUES('shared','Client du projet'),('other','Autre client')").run()
    await db.prepare("INSERT INTO projects(id,organization_id,name) VALUES('project','shared','Projet fichiers')").run()
    for (const [id, role, org] of [['admin', 'admin', null], ['viewer', 'client', 'shared'], ['external', 'client', 'other']]) {
      await db.prepare('INSERT INTO users(id,email,name,password_hash,role,organization_id) VALUES(?,?,?,?,?,?)').run(id, `${id}@example.test`, id, 'unused', role, org)
      await db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,'2090-01-01T00:00:00.000Z')").run(createHash('sha256').update(token(id)).digest('hex'), id)
    }
    await db.prepare("INSERT INTO portal_members(user_id,member_role) VALUES('viewer','viewer')").run()
    const pdf = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF\n')
    const insert = db.prepare("INSERT INTO resources(id,project_id,kind,title,file_name,file_size,file_data,archived,created_by) VALUES(?,'project','file',?,?,?,?,?,'admin')")
    for (const [id, name, body, archived] of [
      ['pdf', "Dossier d'étude.PDF", pdf, 0], ['archived', 'Ancien.pdf', pdf, 1], ['r2-pdf', 'R2.pdf', pdf, 0],
      ['unsupported', 'image.svg', Buffer.from('<svg></svg>'), 0], ['invalid-pdf', 'page.pdf', Buffer.from('<html>%PDF-1.7</html>'), 0],
    ]) {
      await insert.run(id, name, name, body.length, id === 'r2-pdf' ? '' : body.toString('base64'), archived)
    }
    await db.prepare("INSERT INTO portal_objects(id,object_key,resource_id,created_at) VALUES('object','portal/objects/project/pdf','r2-pdf',?)").run(new Date().toISOString())
    await db.close()
    closed = true
    server = spawn(process.execPath, ['node_modules/nuxt/bin/nuxt.mjs', 'dev', '--host', '127.0.0.1', '--port', String(port), '--dotenv', dotenv], {
      env: { ...process.env, NUXT_PUBLIC_SITE_URL: base },
      stdio: process.env.PORTAL_TEST_DEBUG ? 'inherit' : 'ignore',
    })
    let ready = false
    for (let attempt = 0; attempt < 160 && server.exitCode === null; attempt++) {
      try { ready = (await fetch(`${base}/api/portal/auth/me`, { signal: AbortSignal.timeout(5000) })).ok } catch {}
      if (ready) break
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    assert.ok(ready, 'Nuxt test server should start')
    const read = (file, { user, preview = true, range } = {}) => fetch(`${base}/api/portal/files/${file}${preview ? '?preview=1' : ''}`, {
      redirect: 'manual',
      headers: { ...(user ? { cookie: `mc_portal_session=${token(user)}` } : {}), ...(range ? { range } : {}) },
    })

    assert.equal((await read('pdf')).status, 401)
    assert.equal((await read('pdf', { user: 'external' })).status, 404)
    assert.equal((await read('archived', { user: 'admin' })).status, 404)
    assert.equal((await read('unsupported', { user: 'admin' })).status, 415)
    assert.equal((await read('invalid-pdf', { user: 'admin' })).status, 415)
    const preview = await read('pdf', { user: 'viewer' })
    assert.equal(preview.status, 200, await preview.clone().text())
    assert.equal(preview.headers.get('content-type'), 'application/pdf')
    assert.equal(preview.headers.get('content-disposition'), "inline; filename*=UTF-8''Dossier%20d%27%C3%A9tude.PDF")
    assert.equal(preview.headers.get('cache-control'), 'private, no-store')
    assert.equal(preview.headers.get('x-content-type-options'), 'nosniff')
    assert.match(preview.headers.get('content-security-policy'), /frame-ancestors 'self'/)
    assert.deepEqual(Buffer.from(await preview.arrayBuffer()), pdf)

    const ranged = await read('pdf', { user: 'admin', range: 'bytes=0-4' })
    assert.equal(ranged.status, 206)
    assert.equal(ranged.headers.get('content-range'), `bytes 0-4/${pdf.length}`)
    assert.equal(await ranged.text(), '%PDF-')
    const invalidRange = await read('pdf', { user: 'admin', range: `bytes=${pdf.length}-` })
    assert.equal(invalidRange.status, 416)
    assert.equal(invalidRange.headers.get('content-range'), `bytes */${pdf.length}`)

    const download = await read('pdf', { user: 'viewer', preview: false })
    assert.equal(download.status, 200)
    assert.equal(download.headers.get('content-type'), 'application/octet-stream')
    assert.match(download.headers.get('content-disposition'), /^attachment;/)
    assert.deepEqual(Buffer.from(await download.arrayBuffer()), pdf)

    assert.equal((await read('r2-pdf', { user: 'external' })).status, 404)
    for (const inline of [true, false]) {
      const response = await read('r2-pdf', { user: 'admin', preview: inline })
      assert.equal(response.status, 302, await response.clone().text())
      const location = new URL(response.headers.get('location'))
      assert.ok(location.hostname.endsWith('object-store.test.invalid'))
      assert.equal(location.searchParams.get('response-content-type'), inline ? 'application/pdf' : 'application/octet-stream')
      assert.match(location.searchParams.get('response-content-disposition'), inline ? /^inline;/ : /^attachment;/)
      assert.equal(location.searchParams.get('response-cache-control'), 'private, no-store')
      assert.equal(location.searchParams.get('X-Amz-Expires'), '60')
    }
    console.log('PASS accès, PDF local, téléchargement, plages d’octets et signatures R2')
  } finally {
    if (server && server.exitCode === null) {
      const exited = new Promise(resolve => server.once('exit', resolve))
      server.kill()
      await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 3000).unref())])
      if (server.exitCode === null) server.kill('SIGKILL')
    }
    if (!closed) await db.close()
    rmSync(work, { recursive: true, force: true })
  }
}
