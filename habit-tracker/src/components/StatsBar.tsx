interface StatsBarProps {
  totalHabits: number
  completedToday: number
  bestStreak: number
}

export function StatsBar({ totalHabits, completedToday, bestStreak }: StatsBarProps) {
  const todayPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

  return (
    <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
      <StatCard label="Habits" value={String(totalHabits)} icon="📋" />
      <StatCard
        label="Today"
        value={`${completedToday}/${totalHabits}`}
        sub={`${todayPercent}%`}
        icon="✅"
      />
      <StatCard
        label="Best streak"
        value={bestStreak > 0 ? `${bestStreak}d` : '—'}
        icon="🔥"
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string
  sub?: string
  icon: string
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
        <span>{icon}</span>
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {sub && <span className="text-sm text-indigo-300">{sub}</span>}
      </div>
    </div>
  )
}
