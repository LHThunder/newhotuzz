# LIFE OS — hướng dẫn cho Claude Code

Personal operating system: Next.js 15 App Router · React 19 · TypeScript strict · Tailwind + shadcn · Prisma 6 · Supabase · Zustand · Zod · Anthropic SDK. Triển khai trên Vercel.

## Đọc trước khi làm
- `.specify/memory/constitution.md` — **nguyên tắc bắt buộc**, được phép làm gì. Đọc file này trước khi đề xuất bất kỳ giải pháp kiến trúc nào.
- `ARCHITECTURE.md` — hệ thống hiện đang là gì.
- `specs/` — các tính năng đang mở. Chạy `/spec-status` để xem toàn cảnh.

## Quy trình spec-driven
Tính năng mới hoặc thay đổi chạm nhiều file → đi theo:
`/specify` → `/clarify` → `/plan` → `/tasks` → `/analyze` → `/implement`

Sửa lỗi nhỏ, đổi text/style, việc một file → làm thẳng, không cần spec.

Nếu được yêu cầu build một tính năng lớn mà chưa có spec trong `specs/`, hãy nhắc chạy `/specify` trước (nhắc một lần).

## Luật kiến trúc (tóm tắt — bản đầy đủ ở constitution)
- Luồng phụ thuộc: `ui → hooks/stores → server actions → services → prisma`. UI không chạm DB.
- Nghiệp vụ ở `src/server/services/*.service.ts`; server action chỉ là lớp mỏng: zod parse → auth guard → service → `revalidatePath`.
- Mọi input qua Zod ở `src/lib/validations/<module>.ts`.
- Mọi truy vấn lọc theo `userId`. Không có truy vấn xuyên người dùng.
- Không `any`, không `@ts-ignore`.
- Envelope: `{ ok: true, data }` | `{ ok: false, error, fieldErrors? }`.
- Tính năng mới = lát cắt dọc theo đúng khuôn module hiện có (route + components + service + zod). Không thêm tầng kiến trúc mới.

## Lệnh
```
npm run dev          # dev server
npm run build        # prisma generate && next build — phải sạch trước khi coi là xong
npm run db:push      # đẩy schema lên Supabase
npm run db:studio    # Prisma Studio
```

Repo chưa có test tự động — kiểm chứng bằng build sạch + chạy qua acceptance criteria trong spec.

## Ngôn ngữ
Giao diện và tài liệu: tiếng Việt. Định danh trong code: tiếng Anh.
