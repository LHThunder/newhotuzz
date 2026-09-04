import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client cho thao tác Storage phía server (upload, signed URL, xoá).
// KHÔNG bao giờ import ở client — bỏ qua RLS, quyền sở hữu tự kiểm bằng userId + Prisma.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Thiếu cấu hình Supabase service role.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const DOCS_BUCKET = "documents";
