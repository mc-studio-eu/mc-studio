import type { PortalTimeSession } from './portal-project-timer.ts'

export interface PortalClockifySnapshot {
  clients: Array<{ id: string; name: string }>
  projects: Array<{ id: string; name: string; organizationId: string }>
  timeSessions: PortalTimeSession[]
}

interface ClockifyDay {
  date: string
  seconds: number
  sessions: PortalTimeSession[]
}

interface ClockifyWeek {
  monday: string
  days: ClockifyDay[]
  seconds: number
}

const parisCalendar = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })

export function clockifyLocalDate(timestamp: string) {
  const parts = parisCalendar.formatToParts(new Date(timestamp))
  const year = parts.find(part => part.type === 'year')?.value
  const month = parts.find(part => part.type === 'month')?.value
  const day = parts.find(part => part.type === 'day')?.value
  return `${year}-${month}-${day}`
}

function weekStart(date: string) {
  const day = new Date(`${date}T00:00:00Z`)
  const daysSinceMonday = (day.getUTCDay() + 6) % 7
  day.setUTCDate(day.getUTCDate() - daysSinceMonday)
  return day.toISOString().slice(0, 10)
}

export function clockifyWeeks(sessions: ReadonlyArray<PortalTimeSession>): ClockifyWeek[] {
  const weeks = new Map<string, ClockifyWeek>()
  const days = new Map<string, ClockifyDay>()
  const ordered = [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt) || a.id.localeCompare(b.id))
  for (const session of ordered) {
    if (session.stoppedAt === null || session.durationSeconds === null) continue
    const date = clockifyLocalDate(session.startedAt)
    const monday = weekStart(date)
    let week = weeks.get(monday)
    if (!week) {
      week = { monday, days: [], seconds: 0 }
      weeks.set(monday, week)
    }
    let day = days.get(date)
    if (!day) {
      day = { date, seconds: 0, sessions: [] }
      days.set(date, day)
      week.days.push(day)
    }
    day.sessions.push(session)
    day.seconds += session.durationSeconds
    week.seconds += session.durationSeconds
  }
  return [...weeks.values()]
}
