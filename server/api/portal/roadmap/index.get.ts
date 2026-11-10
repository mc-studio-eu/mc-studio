import { projectRoadmap } from '../../../utils/portal-roadmap'
import { accessibleProject } from '../../../utils/portal-resources'

export default defineEventHandler(async event => {
  const projectId = getQuery(event).projectId
  if (projectId !== undefined && typeof projectId !== 'string') throw createError({ statusCode: 400, statusMessage: 'Projet invalide.' })
  const { db, project, user } = await accessibleProject(event, projectId)
  return projectRoadmap(db, project, user)
})
