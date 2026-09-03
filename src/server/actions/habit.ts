"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";
import { habitService } from "@/server/services/habit.service";

type ActionResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

const createHabitSchema = z.object({
  name: z.string().min(1).max(80),
  emoji: z.string().max(8).optional(),
  color: z.string().max(20).optional(),
});

export async function createHabit(input: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  const parsed = createHabitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ." };

  const habit = await habitService.create(user.id, parsed.data.name, parsed.data.emoji, parsed.data.color);
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { ok: true, data: habit };
}

export async function updateHabit(id: string, data: { name?: string; emoji?: string; color?: string }): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  const h = await habitService.update(user.id, id, data);
  revalidatePath("/habits");
  return { ok: true, data: h };
}

export async function deleteHabit(id: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  await habitService.remove(user.id, id);
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { ok: true, data: null };
}

export async function toggleHabitToday(habitId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  const res = await habitService.toggleToday(user.id, habitId);
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { ok: true, data: res };
}

export async function toggleHabitOnDate(habitId: string, dateKey: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  const res = await habitService.toggleOnDate(user.id, habitId, new Date(dateKey));
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { ok: true, data: res };
}
