import { AuthScreen } from './components/AuthScreen'
import { FamilyBanner } from './components/FamilyBanner'
import { FamilySetup } from './components/FamilySetup'
import { HabitDashboard } from './components/HabitDashboard'
import { useAuth } from './hooks/useAuth'
import { useFamily } from './hooks/useFamily'
import { useCloudHabits, useLocalHabits } from './hooks/useHabits'
import { isCloudEnabled } from './lib/supabase'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-400">Loading…</p>
    </div>
  )
}

function LocalApp() {
  const habits = useLocalHabits()

  return (
    <HabitDashboard
      {...habits}
      subtitle="Local mode — data saved in this browser only"
    />
  )
}

function CloudApp() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { family, loading: familyLoading, createFamily, joinFamily } = useFamily(user)
  const habits = useCloudHabits(family)

  if (authLoading) return <LoadingScreen />

  if (!user) {
    return <AuthScreen onSignIn={signIn} onSignUp={signUp} />
  }

  if (familyLoading) return <LoadingScreen />

  if (!family) {
    return (
      <FamilySetup
        onCreate={async (name) => {
          await createFamily(name)
        }}
        onJoin={async (code) => {
          await joinFamily(code)
        }}
      />
    )
  }

  return (
    <HabitDashboard
      {...habits}
      subtitle="Synced with your family — changes appear on every device"
      headerExtra={<FamilyBanner family={family} onSignOut={signOut} />}
    />
  )
}

function App() {
  return isCloudEnabled ? <CloudApp /> : <LocalApp />
}

export default App
