"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

async function uid() {
  const u = await getUser();
  return u?.id ?? null;
}

const createSchema = z.object({
  name: z.string().min(1).max(60),
  kind: z.enum(["cash", "bank", "savings", "investment", "credit", "ewallet"]),
  balance: z.number().default(0),
});

export async function createAccount(input: unknown): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const p = createSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Dữ liệu không hợp lệ." };
  await prisma.account.create({ data: { userId: id, name: p.data.name, kind: p.data.kind, balance: p.data.balance } });
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateAccount(accountId: string, data: { name?: string; kind?: string; balance?: number }): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.account.findFirst({ where: { id: accountId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.account.update({ where: { id: accountId }, data });
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteAccount(accountId: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.account.findFirst({ where: { id: accountId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.account.delete({ where: { id: accountId } }); // transactions cascade
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { ok: true };
}
