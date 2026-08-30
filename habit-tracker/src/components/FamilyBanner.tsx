import { useState } from 'react'
import type { Family } from '../lib/supabase'

interface FamilyBannerProps {
  family: Family
  onSignOut: () => void
}

export function FamilyBanner({ family, onSignOut }: FamilyBannerProps) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    await navigator.clipboard.writeText(family.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 backdrop-blur-sm">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Family</p>
        <p className="font-semibold text-white">{family.name}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10"
          title="Share this code so family members can join"
        >
          <span className="text-slate-400">Invite:</span>
          <span className="font-mono font-semibold tracking-wider text-indigo-300">
            {family.invite_code}
          </span>
          <span className="text-xs text-slate-500">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-xl px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
