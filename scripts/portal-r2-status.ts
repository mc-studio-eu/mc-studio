// Reads application counters only; makes no R2 requests and resets nothing.
import { portalDb } from '../server/utils/portal-db.ts'

const db = await portalDb()
try {
 const utcDay = new Date().toISOString().slice(0, 10)
 const storage = await db.prepare('SELECT bytes_reserved FROM portal_r2_storage_budget WHERE id=1').get()
 const operations = await db.prepare('SELECT operation,used_count FROM portal_r2_daily_operations WHERE utc_day=? ORDER BY operation').all(utcDay)
 console.log(JSON.stringify({
  uploadsEnabled: process.env.R2_UPLOADS_ENABLED?.trim().toLowerCase() === 'true',
  cumulativeReservedBytes: storage ? Number(storage.bytes_reserved) : null,
  storageBudgetBytes: process.env.R2_STORAGE_BUDGET_BYTES || 4 * 1024 ** 3,
  utcDay,
  operations,
  note: 'Compteurs du portail, pas une mesure du bucket ni de la facture Cloudflare. Une suppression ne rembourse pas cette enveloppe. Ne jamais réinitialiser sans rapprochement du bucket.'
 }, null, 2))
} finally {
 await db.close()
}
