#!/usr/bin/env node
import assert from 'node:assert/strict'
import {
  roadmapBounds,
  roadmapCalendar,
  roadmapDateLabel,
  roadmapPeriodLabel,
  toRoadmapDay
} from '../app/utils/portalRoadmapDates.ts'

const day = 86_400_000
const iso = value => new Date(value * day).toISOString().slice(0, 10)

assert.equal(toRoadmapDay('2024-02-29'), toRoadmapDay('2024-02-28') + 1, 'leap day is a single calendar day')
assert.equal(toRoadmapDay('2024-03-01'), toRoadmapDay('2024-02-28') + 2, 'leap year February has 29 days')

const previousTimezone = process.env.TZ
process.env.TZ = 'America/Los_Angeles'
assert.equal(toRoadmapDay('2024-03-10'), toRoadmapDay('2024-03-09') + 1, 'DST transitions do not shift date-only roadmap values')
assert.match(roadmapDateLabel('2024-03-10'), /10 mars 2024/, 'date labels stay on the requested day across DST')
if (previousTimezone === undefined) delete process.env.TZ
else process.env.TZ = previousTimezone

assert.equal(roadmapBounds([{}, { startDate: null, endDate: '' }]), null, 'empty projects have no timeline bounds')
assert.equal(roadmapDateLabel(null), 'À définir')
assert.equal(roadmapPeriodLabel(null, null), 'À définir')

const overlapping = roadmapBounds([
  { startDate: '2030-03-28', endDate: '2030-04-04' },
  { startDate: '2030-04-01', endDate: '2030-04-15' }
])
assert.equal(iso(overlapping.start), '2030-03-28')
assert.equal(iso(overlapping.end), '2030-04-15')
const crossMonthWeek = roadmapCalendar(overlapping, 'week')
assert.ok(crossMonthWeek.ticks.length >= 3, 'weekly calendar spans the full interval')
assert.ok(crossMonthWeek.months.some(month => month.title.includes('mars')))
assert.ok(crossMonthWeek.months.some(month => month.title.includes('avril')))
assert.ok(crossMonthWeek.ticks.every(tick => tick.end > tick.start))

const longBounds = roadmapBounds([{ startDate: '2000-01-01', endDate: '2100-12-31' }])
const longWeeks = roadmapCalendar(longBounds, 'week')
assert.ok(longWeeks.ticks.length <= 261, `century-long weekly range should remain bounded, got ${longWeeks.ticks.length}`)
assert.ok(longWeeks.ticks.length > 100, 'long weekly range keeps useful detail')
assert.equal(roadmapCalendar(longBounds, 'global').ticks.length, 0, 'global mode has no weekly ticks')

console.log('PASS roadmap date and calendar edge cases')
