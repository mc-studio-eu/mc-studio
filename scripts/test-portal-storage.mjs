#!/usr/bin/env node
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { portalDb } from '../server/utils/portal-db.ts'
import { readPortalStorageStatus } from '../server/utils/portal-storage.ts'

// Run with node --experimental-strip-types scripts/test-portal-storage.mjs.
const work = mkdtempSync(join(tmpdir(), 'mc-portal-storage-'))
Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: '',
  NUXT_DATABASE_URL: '',
  NUXT_PORTAL_DB_PATH: join(work, 'portal.sqlite'),
  R2_ENDPOINT: '',
  R2_BUCKET: '',
  R2_ACCESS_KEY_ID: '',
  R2_SECRET_ACCESS_KEY: '',
  R2_UPLOADS_ENABLED: '',
  R2_STORAGE_BUDGET_BYTES: '',
  R2_DAILY_UPLOAD_LIMIT: '',
  R2_DAILY_HEAD_LIMIT: '',
  R2_DAILY_COPY_LIMIT: '',
  R2_DAILY_DOWNLOAD_LIMIT: ''
})

const db = await portalDb()
const now = new Date('2026-11-10T12:00:00.000Z')
const updatedAt = now.toISOString()
const read = () => readPortalStorageStatus(db, now)

try {
  const empty = await read()
  assert.deepEqual(empty.inventory, {
    r2Files: { count: 0, knownBytes: 0, unknownSizeCount: 0 },
    r2Assets: { count: 0, knownBytes: 0, unknownSizeCount: 0 },
    databaseFiles: { count: 0, knownBytes: 0, unknownSizeCount: 0 },
    databaseAssets: { count: 0, knownBytes: 0, unknownSizeCount: 0 },
    orphanObjects: 0
  })
  assert.deepEqual(empty.projects, [])
  assert.equal(empty.budget.reservedBytes, null)
  assert.equal(empty.budget.limitBytes, 4 * 1024 ** 3)
  assert.deepEqual(empty.budget.operations, [
    { operation: 'upload', used: 0, limit: 100 },
    { operation: 'head', used: 0, limit: 1000 },
    { operation: 'copy', used: 0, limit: 1000 },
    { operation: 'download', used: 0, limit: 10000 }
  ])
  assert.equal(empty.r2UploadsRequested, false)
  assert.equal(empty.r2Configured, false)
  console.log('PASS empty database and default limits')

  await db.prepare("INSERT INTO organizations(id,name) VALUES ('org','Client'), ('other','Autre client')").run()
  await db.prepare("INSERT INTO users(id,email,name,password_hash,role) VALUES ('admin','admin@test.invalid','Admin','unused','admin')").run()
  await db.prepare("INSERT INTO projects(id,organization_id,name) VALUES ('one','org','Projet 1'), ('two','other','Projet 2'), ('empty','org','Vide')").run()
  await db.prepare(`
    INSERT INTO resources(id,project_id,kind,title,file_size,file_data,archived,created_by) VALUES
      ('archived-file','one','file','Archivé',3,'YWJj',1,'admin'),
      ('r2-file','one','file','R2',7,'',0,'admin'),
      ('r2-unknown','two','file','R2 sans taille',0,'',0,'admin'),
      ('deleted-file','two','file','Supprimé',5,'',0,'admin'),
      ('external-link','two','file','Lien vers un fichier',0,'',0,'admin')
  `).run()
  await db.prepare(`
    INSERT INTO portal_assets(id,project_id,title,category,file_name,mime_type,file_size,file_data,created_by) VALUES
      ('r2-image','one','R2','illustrations','image.png','image/png',13,'','admin'),
      ('db-image','two','Base','illustrations','image.png','image/png',0,'YWJj','admin')
  `).run()
  await db.prepare(`
    INSERT INTO portal_objects(id,object_key,resource_id,asset_id,created_at) VALUES
      ('r2-file-object','portal/objects/one/file','r2-file',NULL,?),
      ('r2-unknown-object','portal/objects/two/unknown','r2-unknown',NULL,?),
      ('orphan-object','portal/objects/two/deleted','deleted-file',NULL,?),
      ('r2-image-object','portal/objects/one/image',NULL,'r2-image',?)
  `).run(updatedAt, updatedAt, updatedAt, updatedAt)
  await db.prepare("DELETE FROM resources WHERE id='deleted-file'").run()
  const upload = db.prepare(`
    INSERT INTO portal_uploads(id,user_id,project_id,kind,client_key,staging_key,file_name,mime_type,file_size,metadata,expires_at,result_id,created_at)
    VALUES (?,'admin',?,?,?,?,'test.bin','application/octet-stream',?,'{}',?,?,?)
  `)
  await upload.run('pending-file', 'one', 'file', 'file', 'stage-file', 11, '2026-11-10T12:05:00.000Z', null, updatedAt)
  await upload.run('pending-asset', 'two', 'asset', 'asset', 'stage-asset', 17, '2026-11-10T12:05:00.000Z', null, updatedAt)
  await upload.run('expired', 'one', 'file', 'expired', 'stage-expired', 101, updatedAt, null, updatedAt)
  await upload.run('completed', 'one', 'file', 'completed', 'stage-completed', 7, '2026-11-10T12:05:00.000Z', 'r2-file', updatedAt)

  const withFiles = await read()
  assert.deepEqual(withFiles.inventory, {
    r2Files: { count: 2, knownBytes: 7, unknownSizeCount: 1 },
    r2Assets: { count: 1, knownBytes: 13, unknownSizeCount: 0 },
    databaseFiles: { count: 1, knownBytes: 3, unknownSizeCount: 0 },
    databaseAssets: { count: 1, knownBytes: 0, unknownSizeCount: 1 },
    orphanObjects: 1
  })
  assert.deepEqual(withFiles.projects, [
    { id: 'two', name: 'Projet 2', organization: 'Autre client', fileBytes: 0, assetBytes: 0, pendingFileBytes: 0, pendingAssetBytes: 17 },
    { id: 'one', name: 'Projet 1', organization: 'Client', fileBytes: 10, assetBytes: 13, pendingFileBytes: 11, pendingAssetBytes: 0 }
  ])
  assert.equal(await db.prepare('SELECT id FROM portal_r2_storage_budget').get(), undefined)
  console.log('PASS grouped inventory, archived files, unknown sizes, orphans and project quota occupancy')

  await db.prepare('INSERT INTO portal_r2_storage_budget(id,bytes_reserved) VALUES(1,?)').run(123)
  await db.prepare(`
    INSERT INTO portal_r2_daily_operations(operation,utc_day,used_count) VALUES
      ('upload','2026-11-10',5), ('upload','2026-11-09',12), ('download','2026-11-10',3)
  `).run()
  Object.assign(process.env, {
    R2_UPLOADS_ENABLED: ' TRUE ',
    R2_STORAGE_BUDGET_BYTES: '100',
    R2_DAILY_UPLOAD_LIMIT: '4',
    R2_DAILY_HEAD_LIMIT: '0',
    R2_DAILY_COPY_LIMIT: 'invalid'
  })
  const configured = await read()
  assert.equal(configured.updatedAt, updatedAt)
  assert.equal(configured.utcDay, '2026-11-10')
  assert.equal(configured.r2UploadsRequested, true)
  assert.equal(configured.r2Configured, false)
  assert.deepEqual(configured.budget, {
    reservedBytes: 123,
    limitBytes: 100,
    operations: [
      { operation: 'upload', used: 5, limit: 4 },
      { operation: 'head', used: 0, limit: 0 },
      { operation: 'copy', used: 0, limit: null },
      { operation: 'download', used: 3, limit: 10000 }
    ]
  })
  Object.assign(process.env, {
    R2_STORAGE_BUDGET_BYTES: '1.5',
    R2_ENDPOINT: 'https://object-store.test.invalid',
    R2_BUCKET: 'test',
    R2_ACCESS_KEY_ID: 'test',
    R2_SECRET_ACCESS_KEY: 'test'
  })
  const invalidLimit = await read()
  assert.equal(invalidLimit.r2Configured, true)
  assert.equal(invalidLimit.budget.limitBytes, null)
  assert.deepEqual(invalidLimit.inventory, withFiles.inventory)
  console.log('PASS UTC counters, overrides and invalid configuration with no R2 connection')
} finally {
  await db.close()
  rmSync(work, { recursive: true, force: true })
}
