import { parseDateKey, toDateKey } from './date'

export function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0

  const sorted = [...completedDates].sort().reverse()
  const today = toDateKey(new Date())
  const yesterday = toDateKey(new Date(Date.now() - 86400000))

  const mostRecent = sorted[0]
  if (mostRecent !== today && mostRecent !== yesterday) return 0

  let streak = 1
  let current = parseDateKey(mostRecent)

  for (let i = 1; i < sorted.length; i++) {
    const prev = addDays(current, -1)
    if (sorted[i] === toDateKey(prev)) {
      streak++
      current = prev
    } else {
      break
    }
  }

  return streak
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function calculateCompletionRate(
  completedDates: string[],
  createdAt: string,
): number {
  const start = parseDateKey(createdAt.split('T')[0])
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let totalDays = 0
  const cursor = new Date(start)
  while (cursor <= today) {
    totalDays++
    cursor.setDate(cursor.getDate() + 1)
  }

  if (totalDays === 0) return 0
  return Math.round((completedDates.length / totalDays) * 100)
}
