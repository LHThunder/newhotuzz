"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ"),
  content: z.string().min(1, "Hãy viết gì đó").max(20000),
  mood: z.number().int().min(1).max(5).optional(),
});

/** Save (create or update) the journal entry for a specific day. One entry per day. */
export async function saveJournalEntry(input: unknown): Promise<Result> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0].message };

  // Store at UTC midnight so the calendar day is stable across timezones.
  const day = new Date(`${parsed.data.date}T00:00:00.000Z`);
  const existing = await prisma.journalEntry.findFirst({ where: { userId: user.id, date: day } });
  if (existing) {
    await prisma.journalEntry.update({ where: { id: existing.id }, data: { content: parsed.data.content, mood: parsed.data.mood } });
  } else {
    await prisma.journalEntry.create({ data: { userId: user.id, date: day, content: parsed.data.content, mood: parsed.data.mood } });
  }
  revalidatePath("/journal");
  return { ok: true };
}
