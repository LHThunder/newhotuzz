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

export async function deleteTask(id: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  await taskService.remove(user.id, id);
  revalidatePath("/tasks");
  revalidatePath("/");
  return { ok: true, data: null };
}

export async function addSubtask(taskId: string, title: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  if (!title.trim()) return { ok: false, error: "Trống." };
  const st = await taskService.addSubtask(user.id, taskId, title.trim());
  revalidatePath("/tasks");
  return { ok: true, data: st };
}

export async function toggleSubtask(subtaskId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  const st = await taskService.toggleSubtask(user.id, subtaskId);
  revalidatePath("/tasks");
  return { ok: true, data: st };
}

export async function removeSubtask(subtaskId: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  await taskService.removeSubtask(user.id, subtaskId);
  revalidatePath("/tasks");
  return { ok: true, data: null };
}
