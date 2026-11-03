// Run with the same private DB/R2 configuration as the portal. Dry-run by default.
import { portalDb } from '../server/utils/portal-db.ts'
import { portalObjectStoreConfigured, deletePortalObject } from '../server/utils/portal-object-store.ts'

if (!portalObjectStoreConfigured()) throw new Error('R2 is not configured.')
const apply = process.argv.includes('--apply')
const db = await portalDb()
try {
 const cutoff = new Date(Date.now()-24*60*60*1000).toISOString()
 const objects = await db.prepare('SELECT id,object_key FROM portal_objects WHERE resource_id IS NULL AND asset_id IS NULL AND created_at<?').all(cutoff)
 const staging = await db.prepare('SELECT id,staging_key FROM portal_uploads WHERE expires_at<?').all(cutoff)
 console.log(JSON.stringify({mode:apply ? 'apply' : 'dry-run',orphanObjects:objects.length,expiredStaging:staging.length}))
 if (apply) {
  for (const object of objects) {
   await deletePortalObject(object.object_key)
   await db.prepare('DELETE FROM portal_objects WHERE id=? AND resource_id IS NULL AND asset_id IS NULL').run(object.id)
  }
  for (const upload of staging) await deletePortalObject(upload.staging_key)
  // Keep completed idempotency receipts 30 days; expired attempts can be purged.
  const receipts = new Date(Date.now()-30*24*60*60*1000).toISOString()
  await db.prepare('DELETE FROM portal_uploads WHERE (result_id IS NULL AND expires_at<?) OR (result_id IS NOT NULL AND created_at<?)').run(cutoff,receipts)
 }
} finally { await db.close() }
