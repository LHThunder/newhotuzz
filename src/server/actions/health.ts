"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  kind: z.enum(["water", "weight", "steps", "meditation", "calories", "heart_rate"]),
  value: z.number().positive(),
  unit: z.string().max(10).optional(),
});

export async function logHealth(input: unknown): Promise<Result> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ." };

  await prisma.healthMetric.create({
    data: { userId: user.id, ...parsed.data, date: new Date() },
  });
  revalidatePath("/health");
  revalidatePath("/");
  return { ok: true };
}
