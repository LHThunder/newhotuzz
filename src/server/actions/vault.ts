"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { encryptSecret, decryptSecret } from "@/lib/crypto";

type Result = { ok: true } | { ok: false; error: string };

async function uid() {
  const u = await getUser();
  return u?.id ?? null;
}

const createSchema = z.object({
  label: z.string().min(1, "Cần tên dịch vụ").max(80),
  username: z.string().max(160).optional().or(z.literal("")),
  secret: z.string().min(1, "Cần mật khẩu").max(400),
  url: z.string().max(400).optional().or(z.literal("")),
  category: z.string().max(40).optional().or(z.literal("")),
  note: z.string().max(1000).optional().or(z.literal("")),
});

export async function createCredential(input: unknown): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const p = createSchema.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.errors[0].message };
  const d = p.data;
  try {
    await prisma.credential.create({
      data: {
        userId: id, label: d.label, secret: encryptSecret(d.secret),
        username: d.username || null, url: d.url || null, category: d.category || null, note: d.note || null,
      },
    });
  } catch {
    return { ok: false, error: "Không mã hoá được — kiểm tra ENCRYPTION_KEY." };
  }
  revalidatePath("/vault");
  return { ok: true };
}

export async function updateCredential(
  credId: string,
  data: { label?: string; username?: string; secret?: string; url?: string; category?: string; note?: string; favorite?: boolean },
): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.credential.findFirst({ where: { id: credId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  const patch: Record<string, unknown> = { ...data };
  if (typeof data.secret === "string" && data.secret.length > 0) {
    try { patch.secret = encryptSecret(data.secret); } catch { return { ok: false, error: "Không mã hoá được." }; }
  } else {
    delete patch.secret;
  }
  await prisma.credential.update({ where: { id: credId }, data: patch });
  revalidatePath("/vault");
  return { ok: true };
}

export async function deleteCredential(credId: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.credential.findFirst({ where: { id: credId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.credential.delete({ where: { id: credId } });
  revalidatePath("/vault");
  return { ok: true };
}

/** Giải mã mật khẩu theo yêu cầu — trả về plaintext chỉ khi người dùng bấm "hiện". */
export async function revealCredential(credId: string): Promise<{ ok: true; secret: string } | { ok: false; error: string }> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const cred = await prisma.credential.findFirst({ where: { id: credId, userId: id } });
  if (!cred) return { ok: false, error: "Không tìm thấy." };
  try {
    return { ok: true, secret: decryptSecret(cred.secret) };
  } catch {
    return { ok: false, error: "Không giải mã được." };
  }
}
