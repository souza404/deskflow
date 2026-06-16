import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cn, getDeadline, getSLAStatus, formatDuration, SLA_CONFIG } from './utils'
import type { Ticket } from './utils'

const BASE_TICKET: Ticket = {
  id: '1',
  title: 'Test',
  description: 'desc',
  type: 'REQUEST',
  status: 'TODO',
  createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
}

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('deduplicates conflicting tailwind classes, keeping last', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })

  it('filters falsy values', () => {
    expect(cn('a', false && 'b', undefined, null, '')).toBe('a')
  })
})

describe('getDeadline', () => {
  it('REQUEST → 7 days after createdAt', () => {
    const ticket = { ...BASE_TICKET, type: 'REQUEST' as const }
    const deadline = getDeadline(ticket)
    const expected = new Date('2026-01-08T00:00:00Z')
    expect(deadline.getTime()).toBe(expected.getTime())
  })

  it('DEMAND → 30 days after createdAt', () => {
    const ticket = { ...BASE_TICKET, type: 'DEMAND' as const }
    const deadline = getDeadline(ticket)
    const expected = new Date(new Date('2026-01-01T00:00:00Z').getTime() + SLA_CONFIG.DEMAND.duration)
    expect(deadline.getTime()).toBe(expected.getTime())
  })

  it('PROBLEM → 14 days after createdAt', () => {
    const ticket = { ...BASE_TICKET, type: 'PROBLEM' as const }
    const deadline = getDeadline(ticket)
    const expected = new Date(new Date('2026-01-01T00:00:00Z').getTime() + SLA_CONFIG.PROBLEM.duration)
    expect(deadline.getTime()).toBe(expected.getTime())
  })

  it('INCIDENT HIGH → 3 hours after createdAt', () => {
    const ticket = { ...BASE_TICKET, type: 'INCIDENT' as const, priority: 'HIGH' as const }
    const deadline = getDeadline(ticket)
    const expected = new Date('2026-01-01T03:00:00Z')
    expect(deadline.getTime()).toBe(expected.getTime())
  })

  it('INCIDENT MEDIUM → 2 days after createdAt', () => {
    const ticket = { ...BASE_TICKET, type: 'INCIDENT' as const, priority: 'MEDIUM' as const }
    const deadline = getDeadline(ticket)
    const expected = new Date('2026-01-03T00:00:00Z')
    expect(deadline.getTime()).toBe(expected.getTime())
  })

  it('INCIDENT with no priority defaults to LOW (7 days)', () => {
    const ticket = { ...BASE_TICKET, type: 'INCIDENT' as const }
    const deadline = getDeadline(ticket)
    const expected = new Date(new Date('2026-01-01T00:00:00Z').getTime() + SLA_CONFIG.INCIDENT.LOW.duration)
    expect(deadline.getTime()).toBe(expected.getTime())
  })
})

describe('formatDuration', () => {
  it('returns BREACHED for negative ms', () => {
    expect(formatDuration(-1)).toBe('BREACHED')
    expect(formatDuration(-99999)).toBe('BREACHED')
  })

  it('formats 0ms as 0h 0m', () => {
    expect(formatDuration(0)).toBe('0h 0m')
  })

  it('formats exactly 1 hour', () => {
    expect(formatDuration(1000 * 60 * 60)).toBe('1h 0m')
  })

  it('formats hours and minutes correctly', () => {
    const ms = (2 * 60 * 60 + 45 * 60) * 1000 // 2h 45m
    expect(formatDuration(ms)).toBe('2h 45m')
  })

  it('ignores seconds (truncates to minutes)', () => {
    const ms = (1 * 60 * 60 + 1 * 60) * 1000 + 59000 // 1h 1m 59s
    expect(formatDuration(ms)).toBe('1h 1m')
  })
})

describe('getSLAStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('isBreached when now is past deadline', () => {
    // REQUEST = 7 days; set now to 8 days after creation
    vi.setSystemTime(new Date('2026-01-09T00:00:00Z'))
    const status = getSLAStatus(BASE_TICKET)
    expect(status.isBreached).toBe(true)
    expect(status.remaining).toBeLessThan(0)
  })

  it('isWarning when less than 20% remains', () => {
    // REQUEST = 7 days = 604800000ms; 20% = 120960000ms ≈ 1.4 days
    // Set now to 6 days after creation (only 1 day = 86400000ms left ≈ 14%)
    vi.setSystemTime(new Date('2026-01-07T00:00:00Z'))
    const status = getSLAStatus(BASE_TICKET)
    expect(status.isBreached).toBe(false)
    expect(status.isWarning).toBe(true)
  })

  it('healthy when plenty of time remains', () => {
    // Set now to 1 day after creation (6 days left = 85% remaining)
    vi.setSystemTime(new Date('2026-01-02T00:00:00Z'))
    const status = getSLAStatus(BASE_TICKET)
    expect(status.isBreached).toBe(false)
    expect(status.isWarning).toBe(false)
    expect(status.percentage).toBeGreaterThan(0.8)
  })

  it('percentage is 0 or negative when breached', () => {
    vi.setSystemTime(new Date('2026-01-09T00:00:00Z'))
    const status = getSLAStatus(BASE_TICKET)
    expect(status.percentage).toBeLessThanOrEqual(0)
  })
})
