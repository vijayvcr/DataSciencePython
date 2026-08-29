import { useState } from 'react'
import type { Habit } from '../types'
import { HABIT_COLORS, HABIT_EMOJIS } from '../types'

interface HabitFormProps {
  initial?: Pick<Habit, 'name' | 'emoji' | 'color'>
  onSubmit: (name: string, emoji: string, color: string) => void
  onCancel: () => void
  submitLabel: string
}

export function HabitForm({ initial, onSubmit, onCancel, submitLabel }: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? HABIT_EMOJIS[0])
  const [color, setColor] = useState(initial?.color ?? HABIT_COLORS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name, emoji, color)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="habit-name" className="mb-1.5 block text-sm font-medium text-slate-300">
          Habit name
        </label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning run"
          autoFocus
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
        />
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-slate-300">Icon</span>
        <div className="flex flex-wrap gap-2">
          {HABIT_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg transition-all ${
                emoji === e
                  ? 'bg-indigo-500/30 ring-2 ring-indigo-400 scale-110'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-slate-300">Color</span>
        <div className="flex flex-wrap gap-2">
          {HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full transition-all ${
                color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 rounded-xl bg-indigo-500 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/10 px-4 py-2.5 font-medium text-slate-300 transition hover:bg-white/5"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
