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
});

/** Add a transaction without picking an account — uses/creates a default wallet. */
export async function quickAddTransaction(input: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };

  const parsed = quickTxSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ." };

  const account = await financeService.defaultAccount(user.id);
  await financeService.create(user.id, { ...parsed.data, accountId: account.id, date: new Date() });
  revalidatePath("/finance");
  revalidatePath("/");
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
  revalidatePath("/");
  return { ok: true, data };
}
