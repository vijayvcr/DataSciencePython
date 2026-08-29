import {
  addDays,
  formatDayLabel,
  formatDayNumber,
  formatMonthYear,
  isToday,
  startOfWeek,
} from '../utils/date'

interface WeekViewProps {
  weekStart: Date
  onPrevWeek: () => void
  onNextWeek: () => void
  onToday: () => void
}

export function WeekView({ weekStart, onPrevWeek, onNextWeek, onToday }: WeekViewProps) {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const midWeek = weekDays[3]

  return (
    <div className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{formatMonthYear(midWeek)}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToday}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/20"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onPrevWeek}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Previous week"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Next week"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`rounded-xl py-2 text-center ${
              isToday(day) ? 'bg-indigo-500/20 ring-1 ring-indigo-400/50' : ''
            }`}
          >
            <div className="text-xs font-medium text-slate-400">{formatDayLabel(day)}</div>
            <div
              className={`mt-0.5 text-sm font-semibold ${
                isToday(day) ? 'text-indigo-300' : 'text-slate-300'
              }`}
            >
              {formatDayNumber(day)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { startOfWeek }
