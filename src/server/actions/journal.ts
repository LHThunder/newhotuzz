"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  content: z.string().min(1, "Hãy viết gì đó").max(20000),
  mood: z.number().int().min(1).max(5).optional(),
});

export async function createJournalEntry(input: unknown): Promise<Result> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0].message };

  const date = new Date();
  date.setHours(0, 0, 0, 0);
  await prisma.journalEntry.create({
    data: { userId: user.id, date, content: parsed.data.content, mood: parsed.data.mood },
  });
  revalidatePath("/journal");
  return { ok: true };
}
