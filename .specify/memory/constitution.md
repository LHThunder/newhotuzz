# Constitution — LIFE OS

> Hiến pháp kỹ thuật của dự án. Mọi spec / plan / task đều phải tuân thủ.
> Version: 1.0.0 · Ratified: 2026-09-01 · Last amended: 2026-09-01
> Nguồn suy ra: `ARCHITECTURE.md`, `package.json`, `prisma/schema.prisma`, `src/server/**`, `tsconfig.json`.

## 1. Mục đích & phạm vi
LIFE OS là hệ điều hành cá nhân cho công việc, tài chính, học tập, sức khoẻ, mục tiêu và kỷ luật — một app duy nhất thay cho chục app rời rạc. Người dùng: cá nhân chủ sở hữu (multi-tenant sẵn sàng, nhưng không phải sản phẩm SaaS đa tổ chức).

**Không thuộc phạm vi (non-goals):**
- Cộng tác nhiều người trong cùng một workspace (chia sẻ, phân quyền theo team).
- Ứng dụng native riêng cho iOS/Android — phân phối qua PWA.
- Tích hợp bên thứ ba ngoài những gì đã nêu rõ trong spec của từng tính năng.

## 2. Nguyên tắc bất di bất dịch (Principles)

### P1. Kiến trúc một chiều
Luồng phụ thuộc PHẢI là `ui → hooks/stores → server actions → services → prisma`.
Component UI **KHÔNG ĐƯỢC** import `prisma` hay gọi DB trực tiếp. Server action là lớp mỏng: parse → guard → gọi service → revalidate; logic nghiệp vụ nằm ở `src/server/services/*.service.ts`.
*Lý do:* giữ nghiệp vụ test được và tái dùng được giữa action, route handler và cron.

### P2. Server-first
Dữ liệu PHẢI được lấy trong React Server Component. Mutation PHẢI đi qua Server Action typed; chỉ dùng Route Handler (`src/app/api/*`) cho streaming AI, cron, webhook và export.
*Lý do:* bỏ tầng fetch client, giảm state trùng lặp.

### P3. Không có input nào chưa được validate
Mọi input từ ngoài vào PHẢI qua schema Zod đặt tại `src/lib/validations/<module>.ts` trước khi chạm service.
*Lý do:* biên server là nơi duy nhất còn kiểm soát được dữ liệu.

### P4. Cô lập theo người dùng, không có ngoại lệ
Mọi bảng PHẢI có `userId`. Mọi truy vấn trong service PHẢI nhận `userId` và lọc theo nó. **KHÔNG ĐƯỢC** viết truy vấn lấy dữ liệu xuyên người dùng. RLS Postgres (`auth.uid() = user_id`) là lớp phòng thủ thứ hai, không phải lớp duy nhất.
*Lý do:* rò rỉ dữ liệu cá nhân là lỗi không thể sửa sau khi đã xảy ra.

### P5. Module là lát cắt dọc
Một tính năng mới = route + component riêng của module + service + zod schema, theo đúng bộ khung module hiện có. **KHÔNG ĐƯỢC** thêm tầng kiến trúc mới hay pattern song song với pattern đang dùng.
*Lý do:* mọi module đọc giống nhau thì sửa module nào cũng nhanh như nhau.

### P6. Không `any`, không kiểu ngầm
`strict: true` đã bật và PHẢI giữ. **KHÔNG ĐƯỢC** dùng `any` hay `@ts-ignore` để đi tắt; cần thoát kiểu thì dùng `unknown` + thu hẹp kiểu.
*Lý do:* app không có test tự động, kiểu dữ liệu đang là lưới an toàn duy nhất.

### P7. Schema đổi thì migration phải đi kèm
Sửa `prisma/schema.prisma` PHẢI kèm phương án cập nhật DB và tác động lên dữ liệu đang có, nêu rõ trong `plan.md`.
*Lý do:* DB là nơi duy nhất mất dữ liệu là mất thật.

## 3. Ràng buộc kỹ thuật (Constraints)
- **Stack bắt buộc:** Next.js 15 App Router · React 19 · TypeScript strict · Tailwind + shadcn · Prisma 6 · Supabase (Auth + Postgres + Storage) · Zustand (chỉ UI state) · Zod · Framer Motion · Recharts · Anthropic SDK.
- **Kiến trúc:** `ui → hooks/stores → actions → services → prisma` (xem P1).
- **Envelope phản hồi:** `{ ok: true, data }` | `{ ok: false, error, fieldErrors? }`.
- **Không được dùng:** thư viện fetch/data-layer phía client (React Query, SWR, axios) — mâu thuẫn với P2; thư viện chart thứ hai ngoài Recharts; thư viện UI thứ hai ngoài shadcn/Radix.
- **Dependency mới:** phải nêu lý do trong `plan.md` và chứng minh không thể tái dùng thứ đã có.
- **Triển khai:** Vercel. Thay đổi phải build được với `prisma generate && next build`.

## 4. Chuẩn chất lượng (Quality bar)
- **Kiểu dữ liệu:** `next build` và `tsc` phải sạch. Không `any`, không `@ts-ignore`.
- **Validation:** mọi action có Zod schema tương ứng.
- **Xử lý lỗi:** service ném lỗi có ngữ nghĩa; action bắt lỗi và trả envelope `{ ok: false }`; UI luôn có trạng thái rỗng, đang tải và lỗi — không để màn hình trắng.
- **Responsive:** mobile-first, vùng chạm ≥ 44px, hoạt động ở cả dark và light.
- **Test:** [CẦN XÁC NHẬN: repo hiện chưa có test runner nào (`package.json` không có script `test`, không có Vitest/Jest). Chốt một trong hai: (a) chấp nhận không có test tự động, kiểm chứng thủ công theo AC — khi đó mỗi task phải nêu kịch bản kiểm tay; hay (b) thêm Vitest và bắt buộc test cho tầng service.]
- **Ngôn ngữ:** giao diện tiếng Việt; định danh trong code tiếng Anh.

## 5. Quy trình (Workflow)
1. `/constitution` — lập/sửa hiến pháp (hiếm khi đổi)
2. `/specify` — viết **WHAT & WHY**, tuyệt đối không có HOW
3. `/clarify` — chốt các `[NEEDS CLARIFICATION]` trước khi lập plan
4. `/plan` — viết **HOW**: kiến trúc, data model, contracts
5. `/tasks` — chẻ nhỏ thành task có thể kiểm chứng
6. `/analyze` — soát chéo spec ↔ plan ↔ tasks ↔ constitution
7. `/implement` — thực thi theo tasks, không tự ý mở rộng phạm vi

**Cổng chặn (gates):**
- Không `/plan` khi spec còn `[NEEDS CLARIFICATION]`.
- Không `/implement` khi `/analyze` còn phát hiện CRITICAL.
- Code không có task tương ứng = scope creep → phải quay lại `/specify`.

## 6. Quản trị (Governance)
- Sửa hiến pháp phải bump version (semver: MAJOR = bỏ/đổi nguyên tắc, MINOR = thêm nguyên tắc, PATCH = làm rõ câu chữ).
- Khi hiến pháp đổi, rà lại các spec đang mở còn hiệu lực không.
- Khi conflict: Constitution > Spec > Plan > Tasks > code hiện có.
- `ARCHITECTURE.md` mô tả hệ thống **đang là gì**; file này quy định **được phép làm gì**. Hai file mâu thuẫn → file này thắng, và phải cập nhật `ARCHITECTURE.md`.
