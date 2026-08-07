# LIFE OS — System Architecture

> A personal operating system for life, work, finance, learning, health, goals & discipline.
> Design language: Apple · Notion · Linear · Raycast · Arc. Dark-first, light glassmorphism, buttery motion.

---

## 0. High-level architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                              CLIENT (PWA)                               │
│  Next.js 15 App Router · React 19 · TS · Tailwind · shadcn · Motion     │
│                                                                         │
│  ┌── App Shell ──────────────────────────────────────────────────────┐ │
│  │  Sidebar · Topbar · ⌘K Command Palette · Quick Add · Toaster       │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  ┌── Modules (route groups) ─────────────────────────────────────────┐ │
│  │ Dashboard · Tasks · Goals · Projects · Habits · Journal · Brain    │ │
│  │ Finance · Health · Learning · Books · Movies · Analytics · Game    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  State: Server Components (data) + Zustand (UI) + React Query-less RSC  │
└───────────────┬───────────────────────────────────────────────────────┘
                │ Server Actions / Route Handlers (typed)
┌───────────────▼───────────────────────────────────────────────────────┐
│                          SERVER (Next.js runtime)                       │
│  Auth (Supabase SSR) · Zod validation · Service layer · Prisma ORM      │
│  AI orchestration (Anthropic) · Cron jobs (reviews, reminders)          │
└───────────────┬───────────────────────────────────────────────────────┘
                │
┌───────────────▼───────────────────────────────────────────────────────┐
│  Supabase: Postgres (Prisma) · Auth · Storage (images/voice) · Realtime │
│  Row Level Security scoped by user_id on every table                    │
└───────────────────────────────────────────────────────────────────────┘
```

### Core principles
- **Clean architecture**: `ui → hooks → services → prisma`. UI never touches the DB directly.
- **Server-first**: data fetched in RSC; mutations via typed Server Actions guarded by Zod.
- **Multi-tenant by default**: every row carries `userId`; Supabase RLS enforces isolation.
- **Offline / PWA**: service worker + optimistic UI; write queue syncs on reconnect.
- **Extensible modules**: each module is a self-contained slice (routes + components + service).

---

## 1. Database Schema
See `prisma/schema.prisma`. Grouped domains:
- **Identity**: `User`, `Profile`, `Settings`, `Streak`, `Xp`, `Achievement`.
- **Productivity**: `Task`, `Subtask`, `Project`, `Tag`, `Reminder`, `PomodoroSession`.
- **Direction**: `Goal` (self-referential hierarchy Vision→Daily), `Milestone`.
- **Discipline**: `Habit`, `HabitLog`, `Routine`.
- **Reflection**: `JournalEntry`, `Mood`.
- **Knowledge**: `Note`, `NoteLink` (backlinks), `Bookmark`.
- **Finance**: `Account`, `Transaction`, `Budget`, `Subscription`, `Investment`.
- **Health**: `HealthMetric` (unified time-series), `Workout`, `SleepLog`.
- **Learning/Media**: `Course`, `Book`, `Highlight`, `Movie`.
- **Insight**: `DailyLog` (denormalized daily rollup powering the dashboard & analytics).

Every table: `id (cuid)`, `userId`, `createdAt`, `updatedAt`. Soft-delete via `archivedAt`.

## 2. Folder Structure
```
src/
├── app/
│   ├── (marketing)/            # landing, auth
│   ├── (app)/                  # authenticated shell
│   │   ├── layout.tsx          # sidebar + topbar + command palette
│   │   ├── page.tsx            # Dashboard — "Mission Control"
│   │   ├── tasks/  goals/  projects/  habits/  journal/
│   │   ├── brain/  finance/  health/  learning/
│   │   ├── books/  movies/  analytics/  settings/
│   ├── api/                    # route handlers (webhooks, cron, ai stream)
│   ├── layout.tsx  globals.css
├── components/
│   ├── ui/                     # shadcn primitives (glass-styled)
│   ├── layout/                 # sidebar, topbar, command-palette, quick-add
│   ├── dashboard/              # mission-control widgets
│   ├── charts/                 # recharts wrappers
│   └── <module>/               # per-module components
├── lib/
│   ├── prisma.ts  supabase/   auth.ts  utils.ts  nav.ts
│   ├── validations/            # zod schemas per module
│   └── ai/                     # anthropic client + prompt templates
├── server/
│   ├── services/               # business logic (task.service.ts, ...)
│   └── actions/                # server actions (thin, call services)
├── hooks/  stores/ (zustand)   types/
prisma/  schema.prisma  seed.ts
```

## 3. API Design
Two surfaces, both typed end-to-end:
- **Server Actions** (default) for CRUD from the UI — colocated, no client fetch code.
  - Pattern: `action → zod parse → auth guard → service → revalidatePath`.
- **Route Handlers** (`/api/*`) for: AI streaming (`/api/ai/chat`), cron
  (`/api/cron/daily-review`), webhooks (Google Calendar), export (`/api/export`).
- Response envelope: `{ ok: true, data }` | `{ ok: false, error, fieldErrors? }`.

## 4. UI Components
Design tokens in `globals.css`. Primitives: `Card` (glass), `Button` (cva variants),
`Badge`, `Progress`, `Dialog`, `Tooltip`, `Command`. Composite: `StatCard`, `RingChart`,
`Heatmap`, `KanbanBoard`, `WidgetGrid`. Motion via Framer Motion with a shared
`spring` preset and `fade-up` entrance.

## 5. Authentication
Supabase Auth (email + OAuth). `@supabase/ssr` sets cookies in middleware; `getUser()`
in RSC. Middleware protects `(app)` group and redirects unauthenticated users to `/login`.
Postgres RLS policies: `auth.uid() = user_id` on read/write.

## 6. State Management
- **Server state**: RSC + Server Actions (source of truth, revalidated on mutation).
- **Client/UI state**: Zustand stores — `useUIStore` (sidebar, palette, quick-add),
  `useTimerStore` (pomodoro/focus), `usePrefsStore` (theme, accent).
- **Optimistic UI**: `useOptimistic` for toggles (habit check, task done).

## 7. Pages
Each module ships list + detail + multiple views (Tasks: Inbox/Today/Upcoming/Kanban/
Timeline/Calendar). Views are URL-driven (`?view=kanban`) for shareable deep links.

## 8. Dashboard — "Mission Control"
A widget grid: Greeting+Weather+Clock · Daily quote · Mood · Today progress ring ·
Habits done · Priority tasks · Mini calendar · Water · Sleep · Focus time · Streak ·
weekly productivity chart. Powered by one `getMissionControl(userId, date)` query
reading `DailyLog` + live module rollups.

## 9. Responsive Design
Mobile-first. Sidebar collapses to a bottom tab bar + sheet on `< md`. Widget grid is
CSS-grid `auto-fit minmax`. Touch targets ≥ 44px. Command palette works on mobile via
a floating ⌘ button.

## 10. Source code
Delivered module-by-module. This scaffold ships the **foundation + full Dashboard**;
subsequent modules follow the same slice pattern (route + components + service + zod).

---

## AI layer
`lib/ai/` wraps Anthropic. Capabilities: summarize day, plan day/week, weekly/monthly/
yearly reviews, suggest habits/goals/tasks, budget & learning coaching. Each is a
prompt template fed structured context from the services; responses stream to the UI.

## Gamification
`Xp` ledger + derived `level`. `Achievement`/`Badge` unlocked by rule engine evaluated
in the daily cron. Daily/Weekly/Monthly quests generated from user goals & habits.
