import { useState } from 'react'

interface FamilySetupProps {
  onCreate: (name: string) => Promise<void>
  onJoin: (code: string) => Promise<void>
}

export function FamilySetup({ onCreate, onJoin }: FamilySetupProps) {
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [familyName, setFamilyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'create') {
        await onCreate(familyName)
      } else {
        await onJoin(inviteCode)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-4xl">👨‍👩‍👧‍👦</span>
        <h1 className="mt-3 text-2xl font-bold text-white">Set up your family</h1>
        <p className="mt-2 text-sm text-slate-400">
          Create a new family group or join one with an invite code.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-6 flex rounded-xl bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === 'create' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create family
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === 'join' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Join family
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create' ? (
            <div>
              <label htmlFor="family-name" className="mb-1.5 block text-sm font-medium text-slate-300">
                Family name
              </label>
              <input
                id="family-name"
                type="text"
                required
                placeholder="e.g. The Sandilyan Family"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="invite-code" className="mb-1.5 block text-sm font-medium text-slate-300">
                Invite code
              </label>
              <input
                id="invite-code"
                type="text"
                required
                placeholder="6-character code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono tracking-widest text-white uppercase placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              />
              <p className="mt-2 text-xs text-slate-500">
                Ask a family member who already created the group for this code.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 py-2.5 font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'create' ? 'Create family' : 'Join family'}
          </button>
        </form>
      </div>
    </div>
  )
}
