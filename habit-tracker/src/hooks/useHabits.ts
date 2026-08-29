import { useCallback, useEffect, useState } from 'react'
import type { Habit, HabitState } from '../types'
import { toDateKey } from '../utils/date'

const STORAGE_KEY = 'habit-tracker-data'

const defaultState: HabitState = { habits: [], completions: {} }

function loadState(): HabitState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return JSON.parse(raw) as HabitState
  } catch {
    return defaultState
  }
}

function saveState(state: HabitState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useHabits() {
  const [state, setState] = useState<HabitState>(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const addHabit = useCallback((name: string, emoji: string, color: string) => {
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: name.trim(),
      emoji,
      color,
      createdAt: new Date().toISOString(),
    }
    setState((prev) => ({
      ...prev,
      habits: [...prev.habits, habit],
      completions: { ...prev.completions, [habit.id]: [] },
    }))
  }, [])

  const updateHabit = useCallback(
    (id: string, updates: Partial<Pick<Habit, 'name' | 'emoji' | 'color'>>) => {
      setState((prev) => ({
        ...prev,
        habits: prev.habits.map((h) =>
          h.id === id ? { ...h, ...updates, name: updates.name?.trim() ?? h.name } : h,
        ),
      }))
    },
    [],
  )

  const deleteHabit = useCallback((id: string) => {
    setState((prev) => {
      const { [id]: _, ...rest } = prev.completions
      return {
        habits: prev.habits.filter((h) => h.id !== id),
        completions: rest,
      }
    })
  }, [])

  const toggleCompletion = useCallback((habitId: string, date: Date) => {
    const key = toDateKey(date)
    setState((prev) => {
      const dates = prev.completions[habitId] ?? []
      const isCompleted = dates.includes(key)
      const updated = isCompleted
        ? dates.filter((d) => d !== key)
        : [...dates, key]
      return {
        ...prev,
        completions: { ...prev.completions, [habitId]: updated },
      }
    })
  }, [])

  const isCompleted = useCallback(
    (habitId: string, date: Date) => {
      const key = toDateKey(date)
      return (state.completions[habitId] ?? []).includes(key)
    },
    [state.completions],
  )

  const getCompletions = useCallback(
    (habitId: string) => state.completions[habitId] ?? [],
    [state.completions],
  )

  return {
    habits: state.habits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    isCompleted,
    getCompletions,
  }
}
