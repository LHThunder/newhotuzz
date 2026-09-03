"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUser } from "@/lib/supabase/server";
import { financeService } from "@/server/services/finance.service";
import { createTransactionSchema } from "@/lib/validations/finance";

type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

const quickTxSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive(),
  category: z.string().min(1),
  note: z.string().max(200).optional(),
  accountId: z.string().cuid().optional(),
  date: z.coerce.date().optional(),
});

/** Add a transaction. Uses the chosen account+date, or a default wallet + today. */
export async function quickAddTransaction(input: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };

  const parsed = quickTxSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ." };

  const { accountId, date, ...rest } = parsed.data;
  const acc = accountId ?? (await financeService.defaultAccount(user.id)).id;
  await financeService.create(user.id, { ...rest, accountId: acc, date: date ?? new Date() });
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { ok: true, data: null };
}

export async function setBudget(category: string, limit: number): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  if (!category.trim() || limit <= 0) return { ok: false, error: "Dữ liệu không hợp lệ." };
  await financeService.setBudget(user.id, category.trim(), limit);
  revalidatePath("/finance");
  return { ok: true, data: null };
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  await financeService.deleteBudget(user.id, id);
  revalidatePath("/finance");
  return { ok: true, data: null };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };
  await financeService.deleteTransaction(user.id, id);
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { ok: true, data: null };
}

export async function createTransaction(input: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };

  const parsed = createTransactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dữ liệu không hợp lệ.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = await financeService.create(user.id, parsed.data);
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { ok: true, data };
}
