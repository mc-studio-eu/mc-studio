import { clockifyLocalDate, type PortalClockifySnapshot } from './portal-clockify.ts'

export type ClockifyReportPeriod = 'week' | 'month'
export interface ClockifyReportRange { start: string; end: string; dates: string[] }
export interface ClockifyReportGroup { key: string; name: string; detail: string; seconds: number }

export function clockifyReportDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const timestamp = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
}

function dayDate(date: string) {
  return new Date(`${date}T00:00:00Z`)
}

function dateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function clockifyReportRange(anchor: string, period: ClockifyReportPeriod): ClockifyReportRange {
  const first = dayDate(anchor)
  if (period === 'month') first.setUTCDate(1)
  else first.setUTCDate(first.getUTCDate() - (first.getUTCDay() + 6) % 7)
  const last = new Date(first)
  if (period === 'month') last.setUTCMonth(last.getUTCMonth() + 1, 0)
  else last.setUTCDate(last.getUTCDate() + 6)
  const dates: string[] = []
  const cursor = new Date(first)
  while (cursor <= last) {
    dates.push(dateString(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return { start: dateString(first), end: dateString(last), dates }
}

export function clockifyReportMove(anchor: string, period: ClockifyReportPeriod, direction: -1 | 1) {
  const date = dayDate(anchor)
  if (period === 'month') {
    date.setUTCDate(1)
    date.setUTCMonth(date.getUTCMonth() + direction)
  } else date.setUTCDate(date.getUTCDate() + direction * 7)
  return dateString(date)
}

export function clockifyReport(data: PortalClockifySnapshot, range: ClockifyReportRange) {
  const days = range.dates.map(date => ({ date, seconds: 0 }))
  const dayByDate = new Map(days.map(day => [day.date, day]))
  const projectById = new Map(data.projects.map(project => [project.id, project]))
  const clientById = new Map(data.clients.map(client => [client.id, client]))
  const projects = new Map<string, ClockifyReportGroup>()
  const clients = new Map<string, ClockifyReportGroup>()
  let totalSeconds = 0
  let sessionCount = 0

  function add(groups: Map<string, ClockifyReportGroup>, key: string, name: string, detail: string, seconds: number) {
    const group = groups.get(key)
    if (group) group.seconds += seconds
    else groups.set(key, { key, name, detail, seconds })
  }

  for (const session of data.timeSessions) {
    if (session.stoppedAt === null || session.durationSeconds === null) continue
    const day = dayByDate.get(clockifyLocalDate(session.startedAt))
    if (!day) continue
    const seconds = session.durationSeconds
    day.seconds += seconds
    totalSeconds += seconds
    sessionCount++
    const project = session.projectId ? projectById.get(session.projectId) : undefined
    const client = project ? clientById.get(project.organizationId) : undefined
    add(projects, project?.id ?? `deleted:${session.projectName}`, project?.name ?? session.projectName,
      client?.name ?? 'Projet supprimé', seconds)
    add(clients, client?.id ?? 'unavailable', client?.name ?? 'Client non disponible', '', seconds)
  }

  const sorted = (groups: Map<string, ClockifyReportGroup>) => [...groups.values()]
    .sort((a, b) => b.seconds - a.seconds || a.name.localeCompare(b.name, 'fr'))
  return { days, totalSeconds, sessionCount, projects: sorted(projects), clients: sorted(clients) }
}
