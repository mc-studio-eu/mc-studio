#!/usr/bin/env node
import assert from 'node:assert/strict'
import { chmodSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Run with `node --experimental-strip-types scripts/test-portal-r2-budget.mjs`.
// This suite uses only an isolated SQLite database; it never contacts R2.
const work = mkdtempSync(join(tmpdir(), 'mc-portal-r2-budget-'))
chmodSync(work, 0o700)
process.env.DATABASE_URL = ''
process.env.NUXT_DATABASE_URL = ''
process.env.NUXT_PORTAL_DB_PATH = join(work, 'portal.sqlite')
process.env.NODE_ENV = 'test'
process.env.R2_ENDPOINT = ''
process.env.R2_BUCKET = ''
process.env.R2_ACCESS_KEY_ID = ''
process.env.R2_SECRET_ACCESS_KEY = ''

const { portalDb } = await import('../server/utils/portal-db.ts')
const {
  assertPortalR2UploadsEnabled,
  consumePortalR2Operation,
  reservePortalR2Bytes
} = await import('../server/utils/portal-r2-budget.ts')
const db = await portalDb()
let passed = 0

function test(name, fn) {
  return Promise.resolve().then(fn).then(() => {
    passed++
    console.log(`PASS ${name}`)
  })
}

function expectStatus(error, statusCode) {
  assert.equal(error?.statusCode, statusCode, `expected status ${statusCode}, got ${error?.statusCode}: ${error?.message}`)
}

async function rejectsStatus(fn, statusCode) {
  await assert.rejects(fn, error => {
    expectStatus(error, statusCode)
    return true
  })
}

function config(name, value) {
  const previous = process.env[name]
  if (value === undefined) delete process.env[name]
  else process.env[name] = String(value)
  return () => {
    if (previous === undefined) delete process.env[name]
    else process.env[name] = previous
  }
}

async function transactionReserve(bytes) {
  return db.transaction(tx => reservePortalR2Bytes(tx, bytes))
}

async function readReserved() {
  return (await db.prepare('SELECT bytes_reserved AS value FROM portal_r2_storage_budget WHERE id=1').get())?.value
}

async function resetBudget() {
  await db.prepare('DELETE FROM portal_r2_storage_budget').run()
}

try {
  // Legacy records are included in the first initialized reservation, even if
  // they predate the budget ledger.
  await db.prepare('INSERT INTO organizations(id,name) VALUES(?,?)').run('org-test', 'Test')
  await db.prepare(`INSERT INTO users(id,email,name,password_hash,role,organization_id)
    VALUES(?,?,?,?,?,?)`).run('user-test', 'test@example.invalid', 'Test', 'unused', 'admin', 'org-test')
  await db.prepare(`INSERT INTO projects(id,organization_id,name) VALUES(?,?,?)`).run('project-test', 'org-test', 'Test')
  await db.prepare(`INSERT INTO resources(id,project_id,kind,title,file_size,created_by)
    VALUES(?,?,?,?,?,?)`).run('resource-test', 'project-test', 'file', 'Test', 3, 'user-test')
  await db.prepare(`INSERT INTO portal_uploads(id,user_id,project_id,kind,client_key,staging_key,file_name,mime_type,file_size,metadata,expires_at,created_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run('upload-test', 'user-test', 'project-test', 'file', 'legacy', 'stage-test', 'file.bin', 'application/octet-stream', 7, '{}', '2000-01-01', '2000-01-01')
  await db.prepare(`INSERT INTO portal_objects(id,object_key,resource_id,created_at) VALUES(?,?,?,?)`)
    .run('object-test', 'object-test', 'resource-test', '2000-01-01')

  await test('first reservation seeds known legacy staging and object bytes', async () => {
    const restore = config('R2_STORAGE_BUDGET_BYTES', 100)
    try {
      await transactionReserve(1)
      assert.equal(Number(await readReserved()), 11)
    } finally { restore() }
  })

  await test('unknown legacy object size blocks initialization without creating a ledger', async () => {
    await resetBudget()
    await db.prepare(`INSERT INTO portal_uploads(id,user_id,project_id,kind,client_key,staging_key,file_name,mime_type,file_size,metadata,expires_at,created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run('upload-unknown', 'user-test', 'project-test', 'file', 'unknown', 'stage-unknown', 'unknown.bin', 'application/octet-stream', 0, '{}', '2000-01-01', '2000-01-01')
    const restore = config('R2_STORAGE_BUDGET_BYTES', 100)
    try {
      await rejectsStatus(() => transactionReserve(1), 503)
      assert.equal(await readReserved(), undefined)
    } finally {
      restore()
      await db.prepare('DELETE FROM portal_uploads WHERE id=?').run('upload-unknown')
    }
  })

  await test('reservation accepts the exact limit, rejects overflow, and rolls back rejected bytes', async () => {
    await resetBudget()
    // With no legacy rows, the first reservation starts the counter at zero.
    await db.prepare('DELETE FROM portal_uploads WHERE id=?').run('upload-test')
    await db.prepare('DELETE FROM portal_objects WHERE id=?').run('object-test')
    const restore = config('R2_STORAGE_BUDGET_BYTES', 10)
    try {
      await transactionReserve(6)
      await transactionReserve(4)
      assert.equal(Number(await readReserved()), 10)
      await rejectsStatus(() => transactionReserve(1), 503)
      assert.equal(Number(await readReserved()), 10)
      const restoreRollbackCap = config('R2_STORAGE_BUDGET_BYTES', 11)
      try {
        await assert.rejects(db.transaction(async tx => {
          await reservePortalR2Bytes(tx, 1)
          throw new Error('rollback reservation')
        }), /rollback reservation/)
        assert.equal(Number(await readReserved()), 10, 'a caller rollback releases the reservation')
      } finally { restoreRollbackCap() }
    } finally { restore() }
  })

  await test('concurrent reservations serialize and cannot exceed the shared cap', async () => {
    await resetBudget()
    const restore = config('R2_STORAGE_BUDGET_BYTES', 10)
    try {
      const outcomes = await Promise.allSettled([transactionReserve(6), transactionReserve(6)])
      assert.equal(outcomes.filter(result => result.status === 'fulfilled').length, 1)
      const rejected = outcomes.find(result => result.status === 'rejected')
      assert.ok(rejected)
      expectStatus(rejected.reason, 503)
      assert.equal(Number(await readReserved()), 6)
    } finally { restore() }
  })

  await test('reserved bytes remain charged after object deletion and across UTC days', async () => {
    const before = Number(await readReserved())
    await db.prepare('DELETE FROM portal_objects').run()
    await db.prepare('DELETE FROM resources WHERE id=?').run('resource-test')
    await db.prepare('DELETE FROM portal_uploads').run()
    assert.equal(Number(await readReserved()), before)

    const restore = config('R2_DAILY_UPLOAD_LIMIT', 1)
    try {
      await consumePortalR2Operation(db, 'upload', new Date('2026-11-10T23:59:59.000Z'))
      await rejectsStatus(() => consumePortalR2Operation(db, 'upload', new Date('2026-11-10T23:59:59.500Z')), 429)
      await consumePortalR2Operation(db, 'upload', new Date('2026-11-11T00:00:00.000Z'))
      const days = await db.prepare("SELECT utc_day,used_count FROM portal_r2_daily_operations WHERE operation='upload' ORDER BY utc_day").all()
      assert.deepEqual(days.map(row => [row.utc_day, Number(row.used_count)]), [['2026-11-10', 1], ['2026-11-11', 1]])
    } finally { restore() }
  })

  await test('upload, head, copy, and download each enforce their own daily cap', async () => {
    const names = ['R2_DAILY_UPLOAD_LIMIT', 'R2_DAILY_HEAD_LIMIT', 'R2_DAILY_COPY_LIMIT', 'R2_DAILY_DOWNLOAD_LIMIT']
    const restores = names.map(name => config(name, 1))
    try {
      for (const operation of ['upload', 'head', 'copy', 'download']) {
        await consumePortalR2Operation(db, operation, new Date('2026-11-12T12:00:00.000Z'))
        await rejectsStatus(() => consumePortalR2Operation(db, operation, new Date('2026-11-12T13:00:00.000Z')), 429)
      }
      const rows = await db.prepare('SELECT operation,used_count FROM portal_r2_daily_operations WHERE utc_day=? ORDER BY operation').all('2026-11-12')
      assert.deepEqual(rows.map(row => [row.operation, Number(row.used_count)]), [
        ['copy', 1], ['download', 1], ['head', 1], ['upload', 1]
      ])
    } finally { restores.reverse().forEach(restore => restore()) }
  })

  await test('malformed storage and daily cap configuration fails closed', async () => {
    const restoreStorage = config('R2_STORAGE_BUDGET_BYTES', '10bytes')
    try { await rejectsStatus(() => transactionReserve(1), 503) }
    finally { restoreStorage() }
    const restoreDaily = config('R2_DAILY_HEAD_LIMIT', '1.5')
    try { await rejectsStatus(() => consumePortalR2Operation(db, 'head'), 503) }
    finally { restoreDaily() }
  })

  await test('upload switch requires explicit true for R2 and permits unset only on the non-R2 path', async () => {
    const restoreOn = config('R2_UPLOADS_ENABLED', 'true')
    try { assert.doesNotThrow(assertPortalR2UploadsEnabled) }
    finally { restoreOn() }
    for (const value of ['false', 'yes', '1']) {
      const restore = config('R2_UPLOADS_ENABLED', value)
      try { assert.throws(assertPortalR2UploadsEnabled, error => error?.statusCode === 503) }
      finally { restore() }
    }
    const restoreUnset = config('R2_UPLOADS_ENABLED', undefined)
    try {
      assert.throws(assertPortalR2UploadsEnabled, error => error?.statusCode === 503)
      assert.doesNotThrow(() => assertPortalR2UploadsEnabled(false))
    } finally { restoreUnset() }
  })

  console.log(`PASS ${passed} R2 budget tests`)
} finally {
  await db.close()
  rmSync(work, { recursive: true, force: true })
}
