"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";
import { reviewService } from "@/server/services/review.service";

type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  type: z.enum(["weekly_plan", "weekly_review", "monthly_review"]),
  periodKey: z.string().min(1).max(20),
  data: z.record(z.string()),
});

export async function saveReview(input: unknown): Promise<Result> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ." };

  await reviewService.save(user.id, parsed.data.type, parsed.data.periodKey, parsed.data.data);
  const path = parsed.data.type === "monthly_review" ? "/monthly-review" : parsed.data.type === "weekly_review" ? "/weekly-review" : "/weekly-planning";
  revalidatePath(path);
  return { ok: true };
}
