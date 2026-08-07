# LIFE OS 🧭

> A personal operating system for **life · work · finance · learning · health · goals · discipline**.
> Design DNA: Apple · Notion · Linear · Raycast · Arc — dark-first, light glassmorphism, buttery motion.

![status](https://img.shields.io/badge/status-scaffold-8b5cf6) ![next](https://img.shields.io/badge/Next.js-15-black) ![ts](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Đã có trong scaffold này
- **Mission Control Dashboard** — greeting + thời tiết + đồng hồ live + daily quote + mood, progress ring, trackers (nước/ngủ/focus/steps), việc ưu tiên, thói quen hôm nay, biểu đồ năng suất tuần, Life Balance scores, lịch hôm nay.
- **App shell** — sidebar (Arc-style active pill), topbar, **⌘K Command Palette**, **Quick Add**, mobile bottom nav.
- **Tasks** — 7 view switcher + **Kanban kéo-thả** (Framer Motion Reorder).
- **Habits** — **calendar heatmap** 20 tuần, streak, routines, habit list.
- **13 module khác** — trang giới thiệu tính năng (sẵn khung để build tiếp).
- **Design system** — CSS variables, dark/light, glassmorphism, module accent colors.
- **Clean architecture** — `ui → action → service → prisma` + Zod validation (xem `src/server`).
- **Prisma schema** đầy đủ 30+ models cho mọi module.
- Supabase Auth (SSR) + middleware, PWA manifest.

## 🚀 Chạy dev
```bash
npm install
npm run dev
```
Mở http://localhost:3000 — Dashboard chạy ngay với **mock data**, không cần DB.

## 🗄️ Bật database (tuỳ chọn)
1. Tạo project trên [Supabase](https://supabase.com), copy connection strings.
2. `cp .env.example .env` và điền các biến.
3. Đẩy schema & generate client:
```bash
npm run db:push
npm run db:generate
```

## 🧱 Kiến trúc
Xem [`ARCHITECTURE.md`](./ARCHITECTURE.md) cho sơ đồ hệ thống, DB schema, folder structure, API design, auth, state management và responsive.

```
src/
├── app/(app)/          # authenticated shell + module routes
├── components/         # ui/ · layout/ · dashboard/ · charts/ · <module>/
├── lib/                # prisma, supabase, nav, utils, validations, mock
├── server/             # services/ (Prisma) + actions/ (server actions)
├── stores/             # zustand (UI state)
prisma/schema.prisma
```

## 🎹 Phím tắt
| Phím | Hành động |
|------|-----------|
| `⌘K` / `Ctrl K` | Command Palette |
| Nút `+` | Quick Add |

## 🧩 Build module tiếp theo
Mỗi module theo cùng "slice": `route + components + service + zod validation`.
Ví dụ Tasks đã hoàn chỉnh — copy pattern cho Goals, Finance, Health, …

## 🛠 Tech
Next.js 15 · React 19 · TypeScript · Tailwind · shadcn-style UI · Framer Motion · Recharts · Zustand · Supabase · Prisma · PostgreSQL.
