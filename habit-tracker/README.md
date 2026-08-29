# Habit Tracker

A personal habit tracker web app to build daily routines and track your consistency over time.

## Features

- **Add, edit, and delete habits** with custom names, emoji icons, and colors
- **Weekly calendar view** — navigate weeks and tap days to mark habits complete
- **Streak tracking** — see current streaks and overall completion rates per habit
- **Today's progress** — dashboard stats for habits completed today
- **Local persistence** — all data saved in your browser via localStorage (no account needed)

## Getting Started

```bash
cd habit-tracker
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4

## Usage

1. Click **Add habit** (or **Add your first habit** on an empty dashboard)
2. Name your habit, pick an emoji and color
3. Each week shows seven day cells — click a cell to toggle completion
4. Hover a habit row to edit or delete it
5. Use **Today** to jump back to the current week

Data stays in your browser. Clearing site data will reset your habits.
