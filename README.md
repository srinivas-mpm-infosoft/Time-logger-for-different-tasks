# TimeTrack — Multi-Task Time Tracker

A professional, production-ready time tracking application built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **MongoDB**, and **NextAuth v5**.

## Features

- **Multi-task simultaneous timers** — Run any number of timers in parallel
- **Drift-free accuracy** — Timestamp-based calculations, not `setInterval` alone
- **Accurate across refresh/tab-switch/browser reopen**
- **Global controls** — Pause all / Resume all / Stop all with one click
- **Daily logs** — Automatic daily grouping with total tracked time
- **History page** — Browse, filter by date range, and export to CSV
- **Profile & stats** — Productivity chart, total time, completion rate
- **Google OAuth + Email/Password** — Full authentication flow
- **Dark/light mode** — Persisted in localStorage
- **Responsive** — Mobile-first design

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| Database | MongoDB + Mongoose |
| Auth | NextAuth v5 (Auth.js) |
| State | Zustand |
| Forms | React Hook Form + Zod v4 |
| Animations | Framer Motion |
| Charts | Recharts |

---

## Setup

### 1. Clone and install

```bash
cd time-tracker
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/time-tracker
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here     # openssl rand -base64 32
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Google Identity Platform**
3. **Credentials → OAuth 2.0 Client ID** → Web application
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourapp.vercel.app/api/auth/callback/google`
5. Copy credentials to `.env.local`

### 4. MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a DB user with read/write access
3. Copy the connection string to `MONGODB_URI`

### 5. Run

```bash
npm run dev        # Development
npm run build      # Production build
npm start          # Production server
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth handler
│   │   ├── auth/signup/           # Email signup endpoint
│   │   ├── tasks/                 # Task CRUD
│   │   ├── tasks/[id]/            # Single task actions
│   │   ├── tasks/bulk/            # Bulk pause/resume/stop
│   │   ├── logs/                  # History logs
│   │   └── user/stats|profile/    # User data
│   ├── dashboard/                 # Main tracking UI
│   ├── history/                   # Daily log browser
│   ├── profile/                   # User stats
│   ├── login/signup/              # Auth pages
│   └── page.tsx                   # Landing (redirects if logged in)
├── components/
│   ├── auth/          LoginForm, SignupForm
│   ├── dashboard/     TaskCard, AddTaskForm, GlobalControls, TaskFilters, DashboardStats
│   ├── history/       HistoryClient (with CSV export)
│   ├── landing/       LandingPage
│   ├── layout/        Navbar, Footer, ThemeProvider
│   └── profile/       ProfileClient, ProductivityChart
├── hooks/
│   ├── useTasks.ts    # Task CRUD, API calls, 30s background sync
│   └── useTimer.ts    # Per-task rAF-based live elapsed counter
├── lib/
│   ├── auth.ts        # Full NextAuth config (with DB, for server)
│   ├── auth.config.ts # Edge-safe config (for middleware)
│   ├── mongodb.ts     # Mongoose singleton with global caching
│   └── utils.ts       # Duration formatting, date helpers
├── models/            User, Task, DailyLog
├── store/             Zustand timer store (tasks, filters, sort)
├── types/             Shared interfaces + NextAuth session types
└── middleware.ts      # Edge auth guard
```

---

## Timer Architecture

Timers use **timestamp arithmetic** — not interval counting:

```
elapsed = accumulatedTime + (Date.now() - startedAt)
```

- **Start/Resume**: Set `startedAt = now`, `isRunning = true`
- **Pause/Stop**: Add `(now - startedAt)` to `accumulatedTime`, clear `startedAt`
- Display uses `requestAnimationFrame` for smooth sub-second updates
- Works correctly after page refresh, tab switching, or browser restart

---

## Deployment (Vercel + MongoDB Atlas)

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Set environment variables in Vercel Dashboard
4. Add your Vercel domain to Google OAuth redirect URIs
5. Deploy

---

## Security

- API routes validate session and check `userId` ownership on every request
- Passwords hashed with bcrypt (12 rounds)
- Zod validation on all API inputs
- JWT sessions — stateless, no DB session table needed
- All user data is scoped to their account ID
