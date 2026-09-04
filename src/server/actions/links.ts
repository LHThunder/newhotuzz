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

const normalizeUrl = (raw: string) => {
  const t = raw.trim();
  if (!t) return t;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

const createSchema = z.object({
  url: z.string().min(1, "Cần URL").max(500),
  title: z.string().max(160).optional().or(z.literal("")),
  category: z.string().max(40).optional().or(z.literal("")),
  note: z.string().max(1000).optional().or(z.literal("")),
});

export async function createLink(input: unknown): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const p = createSchema.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.errors[0].message };
  const d = p.data;
  const url = normalizeUrl(d.url);
  let favicon: string | null = null;
  try { favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`; } catch { /* URL lạ, bỏ favicon */ }
  await prisma.bookmark.create({
    data: { userId: id, url, title: d.title || null, category: d.category || null, note: d.note || null, favicon },
  });
  revalidatePath("/links");
  return { ok: true };
}

export async function updateLink(
  linkId: string,
  data: { title?: string; category?: string; note?: string; favorite?: boolean },
): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.bookmark.findFirst({ where: { id: linkId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.bookmark.update({ where: { id: linkId }, data });
  revalidatePath("/links");
  return { ok: true };
}

export async function deleteLink(linkId: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.bookmark.findFirst({ where: { id: linkId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.bookmark.delete({ where: { id: linkId } });
  revalidatePath("/links");
  return { ok: true };
}
