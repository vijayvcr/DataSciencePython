import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isCloudEnabled = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isCloudEnabled
  ? createClient(url!, anonKey!)
  : null

export interface Family {
  id: string
  name: string
  invite_code: string
}

export interface DbHabit {
  id: string
  family_id: string
  name: string
  emoji: string
  color: string
  created_at: string
}

export interface DbCompletion {
  habit_id: string
  date: string
}
