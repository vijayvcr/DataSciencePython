import { useMemo, useState } from 'react'
import type { Habit } from '../types'
import { EmptyState } from './EmptyState'
import { HabitForm } from './HabitForm'
import { HabitRow } from './HabitRow'
import { Modal } from './Modal'
import { StatsBar } from './StatsBar'
import { WeekView, startOfWeek } from './WeekView'
import { addDays, getWeekDays, toDateKey } from '../utils/date'
import { calculateStreak } from '../utils/streaks'

type ModalMode = 'add' | 'edit' | null

interface HabitDashboardProps {
  habits: Habit[]
  loading?: boolean
  headerExtra?: React.ReactNode
  subtitle?: string
  addHabit: (name: string, emoji: string, color: string) => void | Promise<void>
  updateHabit: (
    id: string,
    updates: Partial<Pick<Habit, 'name' | 'emoji' | 'color'>>,
  ) => void | Promise<void>
  deleteHabit: (id: string) => void | Promise<void>
  toggleCompletion: (habitId: string, date: Date) => void | Promise<void>
  isCompleted: (habitId: string, date: Date) => boolean
  getCompletions: (habitId: string) => string[]
}

export function HabitDashboard({
  habits,
  loading,
  headerExtra,
  subtitle = 'Build consistency, one day at a time',
  addHabit,
  updateHabit,
  deleteHabit,
  toggleCompletion,
  isCompleted,
  getCompletions,
}: HabitDashboardProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart])
  const todayKey = toDateKey(new Date())

  const completedToday = habits.filter((h) =>
    (getCompletions(h.id) ?? []).includes(todayKey),
  ).length

  const bestStreak = habits.reduce((max, h) => {
    const streak = calculateStreak(getCompletions(h.id))
    return Math.max(max, streak)
  }, 0)

  const closeModal = () => {
    setModalMode(null)
    setEditingHabit(null)
  }

  const run = async (fn: () => void | Promise<void>) => {
    try {
      await fn()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const handleAdd = (name: string, emoji: string, color: string) => {
    run(async () => {
      await addHabit(name, emoji, color)
      closeModal()
    })
  }

  const handleEdit = (name: string, emoji: string, color: string) => {
    if (!editingHabit) return
    run(async () => {
      await updateHabit(editingHabit.id, { name, emoji, color })
      closeModal()
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this habit and all its history?')) {
      run(() => deleteHabit(id))
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Loading habits…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-2xl">✓</span>
          <h1 className="text-2xl font-bold tracking-tight text-white">Habit Tracker</h1>
        </div>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </header>

      {headerExtra}

      {habits.length > 0 && (
        <StatsBar
          totalHabits={habits.length}
          completedToday={completedToday}
          bestStreak={bestStreak}
        />
      )}

      <WeekView
        weekStart={weekStart}
        onPrevWeek={() => setWeekStart((w) => addDays(w, -7))}
        onNextWeek={() => setWeekStart((w) => addDays(w, 7))}
        onToday={() => setWeekStart(startOfWeek(new Date()))}
      />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">
          Your habits
        </h2>
        {habits.length > 0 && (
          <button
            type="button"
            onClick={() => setModalMode('add')}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add habit
          </button>
        )}
      </div>

      {habits.length === 0 ? (
        <EmptyState onAdd={() => setModalMode('add')} />
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              weekDays={weekDays}
              isCompleted={isCompleted}
              onToggle={(id, date) => run(() => toggleCompletion(id, date))}
              onEdit={(h) => {
                setEditingHabit(h)
                setModalMode('edit')
              }}
              onDelete={handleDelete}
              completedDates={getCompletions(habit.id)}
            />
          ))}
        </div>
      )}

      {modalMode === 'add' && (
        <Modal title="New habit" onClose={closeModal}>
          <HabitForm onSubmit={handleAdd} onCancel={closeModal} submitLabel="Create habit" />
        </Modal>
      )}

      {modalMode === 'edit' && editingHabit && (
        <Modal title="Edit habit" onClose={closeModal}>
          <HabitForm
            initial={editingHabit}
            onSubmit={handleEdit}
            onCancel={closeModal}
            submitLabel="Save changes"
          />
        </Modal>
      )}
    </div>
  )
}
