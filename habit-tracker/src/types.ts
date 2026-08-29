export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: string
}

export interface HabitState {
  habits: Habit[]
  completions: Record<string, string[]>
}

export const HABIT_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
] as const

export const HABIT_EMOJIS = [
  '🏃', '💧', '📚', '🧘', '💪', '😴', '🥗', '✍️', '🎯', '🧠',
  '🚶', '☀️', '🎸', '💊', '🧹', '📵', '🙏', '💻', '🌱', '🎨',
] as const
