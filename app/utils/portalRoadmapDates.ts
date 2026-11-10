const day = 86_400_000
const french = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('fr-FR', { ...options, timeZone: 'UTC' })
const dateLabel = french({ day: 'numeric', month: 'short', year: 'numeric' })
const dayLabel = french({ day: 'numeric', month: 'short' })
const monthLabel = french({ month: 'long', year: 'numeric' })

export const fromRoadmapDay = (value: number) => new Date(value * day).toISOString().slice(0, 10)
export const toRoadmapDay = (date: string) => Date.parse(date.slice(0, 10) + 'T00:00:00Z') / day
export const localRoadmapToday = () => new Intl.DateTimeFormat('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
export const roadmapDateLabel = (date: string | null | undefined) => date ? dateLabel.format(toRoadmapDay(date) * day) : 'À définir'
export const roadmapPeriodLabel = (start?: string | null, end?: string | null) => {
  if (start && end && start !== end) return `${roadmapDateLabel(start)} – ${roadmapDateLabel(end)}`
  return roadmapDateLabel(start || end)
}

export type TimelineMode = 'week' | 'month' | 'global'
type TimelineTick = { start: number; end: number; title: string; description?: string }
type Dates = { startDate?: string | null; endDate?: string | null }

const weekStart = (value: number) => value - ((new Date(value * day).getUTCDay() + 6) % 7)

const isoWeek = (value: number) => {
  const thursday = new Date((weekStart(value) + 3) * day)
  const firstDay = new Date(thursday.getTime())
  firstDay.setUTCMonth(0, 1)
  return 1 + Math.floor((thursday.getTime() - firstDay.getTime()) / (7 * day))
}

function monthBoundary(value: number, jump: number) {
  const date = new Date(value * day)
  date.setUTCMonth(date.getUTCMonth() + jump, 1)
  return date.getTime() / day
}

export function roadmapBounds(items: Dates[]) {
  const days = items.flatMap(item => [item.startDate, item.endDate])
    .filter((date): date is string => Boolean(date))
    .map(toRoadmapDay)
    .filter(Number.isFinite)
  if (!days.length) return null
  return days.slice(1).reduce((bounds, value) => ({ start: Math.min(bounds.start, value), end: Math.max(bounds.end, value) }), { start: days[0]!, end: days[0]! })
}

export function roadmapCalendar(bounds: { start: number; end: number }, mode: TimelineMode) {
  const weekly = mode === 'week'
  const start = weekly ? weekStart(bounds.start) : monthBoundary(bounds.start, 0)
  const end = weekly ? weekStart(bounds.end) + 7 : monthBoundary(bounds.end, 1)
  const total = end - start
  const ticks: TimelineTick[] = []
  const months: TimelineTick[] = []

  const monthJump = Math.max(1, Math.ceil(total / (31 * 120)))
  for (let cursor = start; cursor < end;) {
    const next = Math.min(end, monthBoundary(cursor, monthJump))
    const label = monthLabel.format(cursor * day)
    months.push({ start: cursor, end: next, title: monthJump === 1 ? label : `${label} – ${monthLabel.format((next - 1) * day)}` })
    cursor = next
  }
  if (weekly) {
    const step = 7 * Math.max(1, Math.ceil(total / (7 * 260)))
    for (let cursor = start; cursor < end; cursor += step) {
      const next = Math.min(end, cursor + step)
      ticks.push({
        start: cursor,
        end: next,
        title: step === 7 ? `S${isoWeek(cursor)}` : `S${isoWeek(cursor)} – S${isoWeek(next - 1)}`,
        description: `${dayLabel.format(cursor * day)} – ${dayLabel.format((next - 1) * day)}`,
      })
    }
  }
  return {
    start, end, total, months, ticks,
    minWidth: weekly ? ticks.length * 110 : mode === 'month' ? months.length * 124 : months.length * 42,
  }
}
