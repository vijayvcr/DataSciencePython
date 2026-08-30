import { useCallback, useEffect, useState } from 'react'
import type { Family } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import type { User } from './useAuth'

export function useFamily(user: User | null) {
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)

  const loadFamily = useCallback(async () => {
    if (!supabase || !user) {
      setFamily(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const { data: membership, error: memberError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (memberError || !membership) {
      setFamily(null)
      setLoading(false)
      return
    }

    const { data: fam, error: famError } = await supabase
      .from('families')
      .select('id, name, invite_code')
      .eq('id', membership.family_id)
      .single()

    if (famError || !fam) {
      setFamily(null)
    } else {
      setFamily(fam)
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    loadFamily()
  }, [loadFamily])

  const createFamily = useCallback(async (name: string) => {
    if (!supabase) throw new Error('Cloud sync is not configured')
    const { data, error } = await supabase.rpc('create_family', { family_name: name })
    if (error) throw error
    const fam = data as Family
    setFamily(fam)
    return fam
  }, [])

  const joinFamily = useCallback(async (code: string) => {
    if (!supabase) throw new Error('Cloud sync is not configured')
    const { data, error } = await supabase.rpc('join_family', { code })
    if (error) throw error
    const fam = data as Family
    setFamily(fam)
    return fam
  }, [])

  return { family, loading, createFamily, joinFamily, reload: loadFamily }
}
