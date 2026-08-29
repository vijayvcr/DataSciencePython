import { useCallback, useEffect, useState } from 'react'
import type { Habit, HabitState } from '../types'
import { supabase } from '../lib/supabase'
import { toDateKey } from '../utils/date'
import type { Family } from '../lib/supabase'

const STORAGE_KEY = 'habit-tracker-data'
const defaultState: HabitState = { habits: [], completions: {} }

function loadLocalState(): HabitState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return JSON.parse(raw) as HabitState
  } catch {
    return defaultState
  }
}

function saveLocalState(state: HabitState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function dbHabitToHabit(row: { id: string; name: string; emoji: string; color: string; created_at: string }): Habit {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    color: row.color,
    createdAt: row.created_at,
  }
}

/** Local-only habits (no Supabase configured) */
export function useLocalHabits() {
  const [state, setState] = useState<HabitState>(loadLocalState)

  useEffect(() => {
    saveLocalState(state)
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
      const isDone = dates.includes(key)
      const updated = isDone ? dates.filter((d) => d !== key) : [...dates, key]
      return { ...prev, completions: { ...prev.completions, [habitId]: updated } }
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
    loading: false,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    isCompleted,
    getCompletions,
  }
}

/** Cloud-synced family habits via Supabase */
export function useCloudHabits(family: Family | null) {
  const [state, setState] = useState<HabitState>(defaultState)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!supabase || !family) {
      setState(defaultState)
      setLoading(false)
      return
    }

    setLoading(true)

    const { data: habitRows, error: habitError } = await supabase
      .from('habits')
      .select('id, name, emoji, color, created_at')
      .eq('family_id', family.id)
      .order('created_at')

    if (habitError) {
      console.error(habitError)
      setLoading(false)
      return
    }

    const habits = (habitRows ?? []).map(dbHabitToHabit)
    const habitIds = habits.map((h) => h.id)

    let completions: Record<string, string[]> = {}
    if (habitIds.length > 0) {
      const { data: completionRows, error: compError } = await supabase
        .from('completions')
        .select('habit_id, date')
        .in('habit_id', habitIds)

      if (!compError && completionRows) {
        for (const row of completionRows) {
          if (!completions[row.habit_id]) completions[row.habit_id] = []
          completions[row.habit_id].push(row.date)
        }
      }
    }

    for (const h of habits) {
      if (!completions[h.id]) completions[h.id] = []
    }

    setState({ habits, completions })
    setLoading(false)
  }, [family])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!supabase || !family) return

    const channel = supabase
      .channel(`family-${family.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habits', filter: `family_id=eq.${family.id}` },
        () => loadData(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions' }, () =>
        loadData(),
      )
      .subscribe()

    return () => {
      void supabase?.removeChannel(channel)
    }
  }, [family, loadData])

  const addHabit = useCallback(
    async (name: string, emoji: string, color: string) => {
      if (!supabase || !family) return
      const { error } = await supabase.from('habits').insert({
        family_id: family.id,
        name: name.trim(),
        emoji,
        color,
      })
      if (error) throw error
      await loadData()
    },
    [family, loadData],
  )

  const updateHabit = useCallback(
    async (id: string, updates: Partial<Pick<Habit, 'name' | 'emoji' | 'color'>>) => {
      if (!supabase) return
      const payload: Record<string, string> = {}
      if (updates.name !== undefined) payload.name = updates.name.trim()
      if (updates.emoji !== undefined) payload.emoji = updates.emoji
      if (updates.color !== undefined) payload.color = updates.color
      const { error } = await supabase.from('habits').update(payload).eq('id', id)
      if (error) throw error
      await loadData()
    },
    [loadData],
  )

  const deleteHabit = useCallback(
    async (id: string) => {
      if (!supabase) return
      const { error } = await supabase.from('habits').delete().eq('id', id)
      if (error) throw error
      await loadData()
    },
    [loadData],
  )

  const toggleCompletion = useCallback(
    async (habitId: string, date: Date) => {
      if (!supabase) return
      const key = toDateKey(date)
      const dates = state.completions[habitId] ?? []
      const isDone = dates.includes(key)

      if (isDone) {
        const { error } = await supabase
          .from('completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('date', key)
        if (error) throw error
      } else {
        const { error } = await supabase.from('completions').insert({ habit_id: habitId, date: key })
        if (error) throw error
      }

      setState((prev) => {
        const current = prev.completions[habitId] ?? []
        const updated = isDone ? current.filter((d) => d !== key) : [...current, key]
        return { ...prev, completions: { ...prev.completions, [habitId]: updated } }
      })
    },
    [state.completions],
  )

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
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    isCompleted,
    getCompletions,
  }
}
