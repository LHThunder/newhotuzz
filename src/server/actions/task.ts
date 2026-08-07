"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { taskService } from "@/server/services/task.service";
import { createTaskSchema, updateTaskSchema } from "@/lib/validations/task";

type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/** Thin server action: auth → zod → service → revalidate. */
export async function createTask(formData: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };

  const parsed = createTaskSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const task = await taskService.create(user.id, parsed.data);
  revalidatePath("/tasks");
  revalidatePath("/");
  return { ok: true, data: task };
}

export async function updateTask(formData: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };

  const parsed = updateTaskSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false, error: "Dữ liệu không hợp lệ.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const task = await taskService.update(user.id, parsed.data);
  revalidatePath("/tasks");
  return { ok: true, data: task };
}

export async function toggleTaskDone(id: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  const task = await taskService.toggleDone(user.id, id);
  revalidatePath("/tasks");
  revalidatePath("/");
  return { ok: true, data: task };
}
