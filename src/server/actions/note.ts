"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

type ActionResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(20000).optional(),
  kind: z.enum(["note", "idea", "quote", "learning", "reference"]).default("note"),
});

export async function createNote(input: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  const parsed = createNoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ." };

  const note = await prisma.note.create({ data: { ...parsed.data, userId: user.id } });
  revalidatePath("/brain");
  return { ok: true, data: note };
}

/** Single-string create for the InlineAdd bar. */
export async function createNoteQuick(title: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await createNote({ title });
  return res.ok ? { ok: true } : { ok: false, error: res.error };
}
