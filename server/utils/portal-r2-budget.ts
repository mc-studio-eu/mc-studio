import { createError } from 'h3'
import type { PortalDatabase } from './portal-db.ts'

const dailyLimits = {
 upload: ['R2_DAILY_UPLOAD_LIMIT', 100],
 head: ['R2_DAILY_HEAD_LIMIT', 1000],
 copy: ['R2_DAILY_COPY_LIMIT', 1000],
 download: ['R2_DAILY_DOWNLOAD_LIMIT', 10000]
} as const
const storageLimit = ['R2_STORAGE_BUDGET_BYTES', 4 * 1024 ** 3] as const
type Operation = keyof typeof dailyLimits

function configuredLimit(name: string, fallback: number) {
 const value = process.env[name]?.trim()
 if (!value) return fallback
 const parsed = Number(value)
 return /^\d+$/.test(value) && Number.isSafeInteger(parsed) ? parsed : null
}

function requiredLimit(name: string, fallback: number) {
 const parsed = configuredLimit(name, fallback)
 if (parsed === null) {
  throw createError({statusCode:503,statusMessage:'Le budget R2 est mal configuré. Contactez MC Studio.'})
 }
 return parsed
}

export async function readPortalR2Budget(db: PortalDatabase, utcDay: string) {
 const storage = await db.prepare('SELECT bytes_reserved FROM portal_r2_storage_budget WHERE id=1').get()
 const operations = await db.prepare('SELECT operation,used_count FROM portal_r2_daily_operations WHERE utc_day=?').all(utcDay)
 const usedByOperation = new Map(operations.map(row => [row.operation, Number(row.used_count)]))
 return {
  reservedBytes: storage ? Number(storage.bytes_reserved) : null,
  limitBytes: configuredLimit(...storageLimit),
  operations: (Object.keys(dailyLimits) as Operation[]).map(operation => ({
   operation,
   used: usedByOperation.get(operation) ?? 0,
   limit: configuredLimit(...dailyLimits[operation])
  }))
 }
}

export function assertPortalR2UploadsEnabled(requiresOptIn = true) {
 const enabled = process.env.R2_UPLOADS_ENABLED?.trim().toLowerCase()
 if (enabled !== 'true' && (requiresOptIn || enabled)) {
  throw createError({statusCode:503,statusMessage:'Les dépôts sont suspendus. Contactez MC Studio.'})
 }
}

export function portalR2UploadsRequested() {
 return process.env.R2_UPLOADS_ENABLED?.trim().toLowerCase() === 'true'
}

export async function consumePortalR2Operation(db: PortalDatabase, operation: Operation, now = new Date()) {
 const max = requiredLimit(...dailyLimits[operation])
 const result = max > 0 && await db.prepare(`
  INSERT INTO portal_r2_daily_operations(operation,utc_day,used_count) VALUES(?,?,1)
  ON CONFLICT(operation,utc_day) DO UPDATE SET used_count=portal_r2_daily_operations.used_count+1
  WHERE portal_r2_daily_operations.used_count<?
 `).run(operation,now.toISOString().slice(0,10),max)
 if (!result || !result.changes) {
  throw createError({statusCode:429,statusMessage:'Le budget quotidien de stockage est atteint. Réessayez demain ou contactez MC Studio.'})
 }
}

// Called inside a transaction. The conditional UPDATE serializes reservations
// across every instance and project. A caller must commit before touching R2.
export async function reservePortalR2Bytes(db: PortalDatabase, bytes: number) {
 const max = requiredLimit(...storageLimit)
 if (!Number.isSafeInteger(bytes) || bytes <= 0) throw new Error('Invalid R2 reservation size.')
 if (!await db.prepare('SELECT id FROM portal_r2_storage_budget WHERE id=1').get()) {
  // Include all known old staging keys, even expired or completed ones: PUT
  // replay and failed cleanup may have left bytes at any of these keys.
  const legacy = await db.prepare(`
   SELECT COALESCE(SUM(CASE WHEN file_size>0 THEN file_size ELSE 0 END),0) AS total,
          COALESCE(SUM(CASE WHEN file_size>0 THEN 0 ELSE 1 END),0) AS unknown
   FROM (
    SELECT file_size FROM portal_uploads
    UNION ALL
    SELECT COALESCE(r.file_size,a.file_size) FROM portal_objects o
    LEFT JOIN resources r ON r.id=o.resource_id
    LEFT JOIN portal_assets a ON a.id=o.asset_id
   ) AS existing_objects
  `).get()
  const total = Number(legacy.total)
  if (Number(legacy.unknown) || !Number.isSafeInteger(total)) {
   throw createError({statusCode:503,statusMessage:'Le stockage R2 doit être vérifié avant de reprendre les dépôts. Contactez MC Studio.'})
  }
  await db.prepare('INSERT INTO portal_r2_storage_budget(id,bytes_reserved) VALUES(1,?) ON CONFLICT(id) DO NOTHING').run(total)
 }
 const result = await db.prepare('UPDATE portal_r2_storage_budget SET bytes_reserved=bytes_reserved+? WHERE id=1 AND bytes_reserved<=?').run(bytes,max-bytes)
 if (!result.changes) {
  throw createError({statusCode:503,statusMessage:'Le budget global de stockage est atteint. Contactez MC Studio.'})
 }
}
