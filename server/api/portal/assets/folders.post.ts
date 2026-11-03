import { randomUUID } from 'node:crypto'
import { PORTAL_ASSET_DEFAULT_FOLDERS, portalAssetFolderKey } from '#shared/portal-assets'
import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { accessibleProject, recordActivity } from '../../../utils/portal-resources'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const user = await requirePortalUser(event, 'admin')
  const body = await readBody(event)
  const { db, project } = await accessibleProject(event, typeof body?.projectId === 'string' ? body.projectId : '')
  const label = typeof body?.label === 'string' ? body.label.trim().normalize('NFC') : ''
  if (!label || label.length > 80 || /[\x00-\x1f\x7f]/.test(label)) {
    throw createError({ statusCode: 400, statusMessage: 'Choisissez un nom de dossier de 1 à 80 caractères.' })
  }
  const nameKey = portalAssetFolderKey(label)
  if (PORTAL_ASSET_DEFAULT_FOLDERS.some(folder => portalAssetFolderKey(folder.label) === nameKey)) {
    throw createError({ statusCode: 409, statusMessage: 'Un dossier porte déjà ce nom.' })
  }
  const id = randomUUID()
  await db.transaction(async () => {
    const inserted = await db.prepare('INSERT INTO portal_asset_folders(id,project_id,label,name_key,created_by) VALUES(?,?,?,?,?) ON CONFLICT(project_id,name_key) DO NOTHING').run(id, project.id, label, nameKey, user.id)
    if (!inserted.changes) throw createError({ statusCode: 409, statusMessage: 'Un dossier porte déjà ce nom.' })
    await recordActivity(project.id, `MC Studio a créé un dossier d’assets : ${label}`)
  })
  return { id, label }
})
