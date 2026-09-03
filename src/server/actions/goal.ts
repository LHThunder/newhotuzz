"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { goalService } from "@/server/services/goal.service";
import { createGoalSchema } from "@/lib/validations/goal";

type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createGoal(input: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };

  const parsed = createGoalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dữ liệu không hợp lệ.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const goal = await goalService.create(user.id, parsed.data);
  revalidatePath("/goals");
  return { ok: true, data: goal };
}

export async function toggleMilestone(milestoneId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  const goal = await goalService.toggleMilestone(user.id, milestoneId);
  revalidatePath("/goals");
  return { ok: true, data: goal };
}

export async function addMilestone(goalId: string, title: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  if (!title.trim()) return { ok: false, error: "Trống." };
  await goalService.addMilestone(user.id, goalId, title.trim());
  revalidatePath("/goals");
  return { ok: true, data: null };
}

export async function deleteMilestone(milestoneId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  await goalService.deleteMilestone(user.id, milestoneId);
  revalidatePath("/goals");
  return { ok: true, data: null };
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  await goalService.deleteGoal(user.id, id);
  revalidatePath("/goals");
  return { ok: true, data: null };
}

export async function setGoalProject(goalId: string, projectId: string | null): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  await goalService.assertOwner(user.id, goalId);
  await prisma.goal.update({ where: { id: goalId }, data: { projectId } });
  revalidatePath("/goals");
  return { ok: true, data: null };
}
