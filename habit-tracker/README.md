# Family Habit Tracker

A shared habit tracker for you and your family. Everyone signs in, joins the same family group, and sees the same habits synced in real time across phones, tablets, and computers.

**Live app (after setup):** https://vijayvcr.github.io/DataSciencePython/habit-tracker/

## Features

- **Family sharing** — one invite code lets everyone join the same group
- **Cross-device sync** — habits and completions stored in the cloud (Supabase)
- **Weekly calendar** — tap days to mark habits complete
- **Streaks & stats** — track consistency per habit
- **Free hosting** — deployed automatically to GitHub Pages on every merge to `master`

## One-time setup (~10 minutes)

### 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open **SQL Editor** → **New query**
3. Paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql)
4. Go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 2. Add GitHub repository secrets

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|--------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

### 3. Enable GitHub Pages

1. Go to **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**
3. Set **Branch** to `gh-pages` and folder to `/ (root)`
4. Save

After merging to `master`, the deploy workflow runs automatically. Your app will be at:

**https://vijayvcr.github.io/DataSciencePython/habit-tracker/**

### 4. Optional: enable realtime sync

In Supabase: **Database → Publications → supabase_realtime** → enable `habits` and `completions` tables so changes appear instantly on all devices.

### 5. Disable email confirmation (recommended for family use)

In Supabase: **Authentication → Providers → Email** → turn off **Confirm email** so family members can sign up and use the app immediately.

## How your family uses it

1. **You (first person):** Sign up → **Create family** → share the 6-character invite code
2. **Everyone else:** Sign up → **Join family** → enter the invite code
3. Add habits together — everyone sees the same list and can check off days

## Local development

```bash
cd habit-tracker
cp .env.example .env.local   # add your Supabase keys for cloud mode
npm install
npm run dev
```

Without Supabase keys, the app runs in **local-only mode** (data stays in your browser).

## Build

```bash
npm run build    # production build
npm run preview  # preview production build locally
```

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Supabase (Auth + Postgres + Realtime)
- GitHub Pages (hosting)

## Cost

Everything runs on free tiers:

- **GitHub Pages** — free static hosting
- **Supabase** — free tier (500 MB database, 50k monthly active users)

No credit card required for either service on the free plan.
