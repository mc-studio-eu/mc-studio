import { clockifyLocalDate, type PortalClockifySnapshot } from './portal-clockify.ts'

export type ClockifyReportPeriod = 'week' | 'month'
export interface ClockifyReportRange {
  start: string
  end: string
  dates: string[]
  aggregation: 'day' | 'month' | 'year'
  bucketYears: number
}
export interface ClockifyReportGroup { key: string; name: string; detail: string; seconds: number }
export interface ClockifyReportFilters { clientId?: string; projectId?: string }

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
  return buildRange(dateString(first), dateString(last))
}

function buildRange(start: string, end: string): ClockifyReportRange {
  const first = dayDate(start)
  const last = dayDate(end)
  const dayCount = Math.round((last.getTime() - first.getTime()) / 86400000) + 1
  const monthCount = (last.getUTCFullYear() - first.getUTCFullYear()) * 12 + last.getUTCMonth() - first.getUTCMonth() + 1
  const aggregation = dayCount <= 62 ? 'day' : monthCount <= 36 ? 'month' : 'year'
  const bucketYears = aggregation === 'year' ? Math.ceil((last.getUTCFullYear() - first.getUTCFullYear() + 1) / 60) : 1
  const dates: string[] = []
  const cursor = new Date(first)
  while (cursor <= last) {
    dates.push(dateString(cursor))
    if (aggregation === 'day') cursor.setUTCDate(cursor.getUTCDate() + 1)
    else if (aggregation === 'month') cursor.setUTCMonth(cursor.getUTCMonth() + 1, 1)
    else {
      cursor.setUTCMonth(0, 1)
      cursor.setUTCFullYear(cursor.getUTCFullYear() + bucketYears)
    }
  }
  return { start, end, dates, aggregation, bucketYears }
}

export function clockifyReportCustomRange(start: string, end: string): ClockifyReportRange | undefined {
  if (!clockifyReportDate(start) || !clockifyReportDate(end) || start > end) return
  return buildRange(start, end)
}

export function clockifyReportMove(anchor: string, period: ClockifyReportPeriod, direction: -1 | 1) {
  const date = dayDate(anchor)
  if (period === 'month') {
    date.setUTCDate(1)
    date.setUTCMonth(date.getUTCMonth() + direction)
  } else date.setUTCDate(date.getUTCDate() + direction * 7)
  return dateString(date)
}

export function clockifyReport(data: PortalClockifySnapshot, range: ClockifyReportRange, filters: ClockifyReportFilters = {}) {
  const days = range.dates.map((date, index) => {
    const nextDate = range.dates[index + 1]
    const end = nextDate ? new Date(dayDate(nextDate).getTime() - 86400000) : dayDate(range.end)
    return { date, endDate: dateString(end), seconds: 0 }
  })
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
    if (filters.projectId && session.projectId !== filters.projectId) continue
    const project = session.projectId ? projectById.get(session.projectId) : undefined
    if (filters.clientId && project?.organizationId !== filters.clientId) continue
    const date = clockifyLocalDate(session.startedAt)
    const day = days.find(bucket => date >= bucket.date && date <= bucket.endDate)
    if (!day) continue
    const seconds = session.durationSeconds
    day.seconds += seconds
    totalSeconds += seconds
    sessionCount++
    const client = project ? clientById.get(project.organizationId) : undefined
    add(projects, project?.id ?? `deleted:${session.projectName}`, project?.name ?? session.projectName,
      client?.name ?? 'Projet supprimé', seconds)
    add(clients, client?.id ?? 'unavailable', client?.name ?? 'Client non disponible', '', seconds)
  }

  const sorted = (groups: Map<string, ClockifyReportGroup>) => [...groups.values()]
    .sort((a, b) => b.seconds - a.seconds || a.name.localeCompare(b.name, 'fr'))
  return { days, totalSeconds, sessionCount, projects: sorted(projects), clients: sorted(clients) }
}
