import { randomUUID } from 'node:crypto'
import { assertSameOrigin, requirePortalUser } from '../../../utils/portal-auth'
import { mockupContext } from '../../../utils/portal-mockups'
import { recordActivity } from '../../../utils/portal-resources'
import { figmaImage, figmaRequest, inspectFigma } from '../../../utils/portal-figma'

export default defineEventHandler(async event => {
  assertSameOrigin(event)
  const user = await requirePortalUser(event, 'admin')
  const body = await readBody(event)
  const { db, project, version } = await mockupContext(event, body.projectId, body.versionId)
  const sourceVersion = String(body.sourceVersion || '')
  const nodeIds = Array.isArray(body.nodeIds) ? [...new Set(body.nodeIds)].filter((id): id is string => typeof id === 'string' && /^\d+:\d+$/.test(id)) : []
  if (!/^\d{1,40}$/.test(sourceVersion) || !nodeIds.length) throw createError({ statusCode: 400, statusMessage: 'Choisissez au moins une nouvelle page Figma.' })
  if (nodeIds.length > 100) throw createError({ statusCode: 400, statusMessage: 'Ajoutez au maximum 100 pages à la fois.' })

  const file = await inspectFigma(version.file_key, sourceVersion)
  const selected = nodeIds.map(id => file.screens.find(screen => screen.id === id))
  if (selected.some(screen => !screen)) throw createError({ statusCode: 400, statusMessage: 'Une page a changé dans Figma. Rechargez la liste.' })
  const params = new URLSearchParams({ ids: nodeIds.join(','), version: sourceVersion, format: 'png', scale: '1', use_absolute_bounds: 'true' })
  const rendered = await figmaRequest(`images/${version.file_key}?${params}`)
  const exports = []
  for (const screen of selected) {
    if (!screen) continue
    const url = rendered.images?.[screen.id]
    if (!url) throw createError({ statusCode: 502, statusMessage: 'Figma n’a pas pu exporter toutes les pages. Aucune page n’a été ajoutée.' })
    exports.push({ ...screen, ...await figmaImage(url) })
  }

  const screenIds = await db.transaction(async () => {
    if (db.dialect === 'postgres') await db.prepare('SELECT id FROM projects WHERE id=? FOR UPDATE').get(project.id)
    const current = await db.prepare("SELECT id FROM mockup_versions WHERE id=? AND resource_id=?").get(version.id, version.resource_id)
    if (!current) throw createError({ statusCode: 404, statusMessage: 'Version introuvable.' })
    const existing = await db.prepare('SELECT id,node_id AS nodeId,file_size AS fileSize FROM mockup_screens WHERE version_id=?').all(version.id) as { id: string; nodeId: string; fileSize: number }[]
    const existingByNode = new Map(existing.map(screen => [screen.nodeId, screen]))
    const addedCount = nodeIds.filter(id => !existingByNode.has(id)).length
    if (existing.length + addedCount > 500) throw createError({ statusCode: 400, statusMessage: 'Une version ne peut pas dépasser 500 pages.' })
    const storage = await db.prepare('SELECT COALESCE(SUM(s.file_size),0) AS total FROM mockup_screens s JOIN mockup_versions v ON v.id=s.version_id JOIN resources r ON r.id=v.resource_id WHERE r.project_id=?').get(project.id)
    const sizeDelta = exports.reduce((sum, screen) => sum + screen.size - Number(existingByNode.get(screen.id)?.fileSize || 0), 0)
    if (Number(storage.total) + sizeDelta > 200 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: 'Les maquettes de ce projet dépassent 200 Mo.' })
    const position = await db.prepare('SELECT COALESCE(MAX(position),-1)+1 AS next FROM mockup_screens WHERE version_id=?').get(version.id)
    const ids: string[] = []
    let replacedCount = 0, addedOffset = 0
    for (const screen of exports) {
      const existingScreen = existingByNode.get(screen.id)
      if (existingScreen) {
        ids.push(existingScreen.id)
        replacedCount++
        await db.prepare('UPDATE mockup_screens SET name=?,width=?,height=?,image_data=?,file_size=? WHERE id=? AND version_id=?').run(screen.name, Math.round(screen.width), Math.round(screen.height), screen.data, screen.size, existingScreen.id, version.id)
      } else {
        const id = randomUUID()
        ids.push(id)
        await db.prepare('INSERT INTO mockup_screens(id,version_id,node_id,name,position,width,height,image_data,file_size) VALUES(?,?,?,?,?,?,?,?,?)').run(id, version.id, screen.id, screen.name, Number(position.next) + addedOffset++, Math.round(screen.width), Math.round(screen.height), screen.data, screen.size)
      }
    }
    await db.prepare("UPDATE mockup_versions SET state='pending',reviewed_by=NULL,reviewed_at=NULL WHERE id=?").run(version.id)
    await db.prepare('UPDATE resources SET updated_at=CURRENT_TIMESTAMP WHERE id=?').run(version.resource_id)
    await db.prepare(`INSERT INTO project_reviews(project_id,state,feedback,updated_by) VALUES(?,'pending','',?) ON CONFLICT(project_id) DO UPDATE SET state='pending',feedback='',updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`).run(project.id,user.id)
    await recordActivity(project.id, `MC Studio a ajouté ${addedCount} page(s) et remplacé ${replacedCount} page(s) dans « ${version.title} » · version ${version.number}.`)
    return { ids, addedCount, replacedCount }
  })
  return { ok: true, count: exports.length, screenIds: screenIds.ids, addedCount: screenIds.addedCount, replacedCount: screenIds.replacedCount }
})
