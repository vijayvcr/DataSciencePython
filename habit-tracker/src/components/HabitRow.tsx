import type { Habit } from '../types'
import { calculateCompletionRate, calculateStreak } from '../utils/streaks'

interface HabitRowProps {
  habit: Habit
  weekDays: Date[]
  isCompleted: (habitId: string, date: Date) => boolean
  onToggle: (habitId: string, date: Date) => void
  onEdit: (habit: Habit) => void
  onDelete: (id: string) => void
  completedDates: string[]
}

export function HabitRow({
  habit,
  weekDays,
  isCompleted,
  onToggle,
  onEdit,
  onDelete,
  completedDates,
}: HabitRowProps) {
  const streak = calculateStreak(completedDates)
  const rate = calculateCompletionRate(completedDates, habit.createdAt)

  return (
    <div className="group rounded-2xl border border-white/8 bg-white/4 p-4 backdrop-blur-sm transition hover:border-white/15 hover:bg-white/6">
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: `${habit.color}25` }}
        >
          {habit.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-white">{habit.name}</h3>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
            {streak > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-orange-400">🔥</span>
                {streak} day{streak !== 1 ? 's' : ''}
              </span>
            )}
            <span>{rate}% overall</span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(habit)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label={`Edit ${habit.name}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(habit.id)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/20 hover:text-red-400"
            aria-label={`Delete ${habit.name}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekDays.map((day) => {
          const done = isCompleted(habit.id, day)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const checkDay = new Date(day)
          checkDay.setHours(0, 0, 0, 0)
          const future = checkDay > today

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={future}
              onClick={() => onToggle(habit.id, day)}
              className={`aspect-square rounded-xl transition-all ${
                future
                  ? 'cursor-not-allowed opacity-30'
                  : done
                    ? 'scale-105 shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 hover:scale-105'
              }`}
              style={
                done
                  ? { backgroundColor: habit.color, boxShadow: `0 4px 14px ${habit.color}40` }
                  : undefined
              }
              aria-label={`Toggle ${habit.name} for ${day.toDateString()}`}
            >
              {done && (
                <svg className="mx-auto h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
