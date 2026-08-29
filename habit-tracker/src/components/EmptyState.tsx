interface EmptyStateProps {
  onAdd: () => void
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/2 px-6 py-16 text-center">
      <div className="mb-4 text-5xl">🌱</div>
      <h3 className="mb-2 text-lg font-semibold text-white">No habits yet</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-400">
        Start building better routines. Add your first habit and track your progress each day.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-xl bg-indigo-500 px-6 py-2.5 font-medium text-white transition hover:bg-indigo-400"
      >
        Add your first habit
      </button>
    </div>
  )
}
