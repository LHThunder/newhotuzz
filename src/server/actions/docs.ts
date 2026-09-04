"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient, DOCS_BUCKET } from "@/lib/supabase/admin";

type Result = { ok: true } | { ok: false; error: string };

async function uid() {
  const u = await getUser();
  return u?.id ?? null;
}

const MAX_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED = [
  /^image\//,
  /^application\/pdf$/,
  /^text\/plain$/,
  /^text\/csv$/,
  /^application\/msword$/,
  /^application\/vnd\.openxmlformats-officedocument\./,
  /^application\/vnd\.ms-excel$/,
  /^application\/vnd\.ms-powerpoint$/,
];

const safeName = (n: string) => n.normalize("NFKD").replace(/[^\w.\- ]/g, "_").replace(/\s+/g, "_").slice(-120) || "file";

// ── Folders ──
export async function createFolder(name: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const p = z.string().min(1, "Cần tên mục").max(60).safeParse(name.trim());
  if (!p.success) return { ok: false, error: p.error.errors[0].message };
  await prisma.docFolder.create({ data: { userId: id, name: p.data } });
  revalidatePath("/documents");
  return { ok: true };
}

export async function renameFolder(folderId: string, name: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const p = z.string().min(1).max(60).safeParse(name.trim());
  if (!p.success) return { ok: false, error: "Tên không hợp lệ." };
  const owned = await prisma.docFolder.findFirst({ where: { id: folderId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.docFolder.update({ where: { id: folderId }, data: { name: p.data } });
  revalidatePath("/documents");
  return { ok: true };
}

/** Xoá mục + toàn bộ file bên trong (cả trên Storage). */
export async function deleteFolder(folderId: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.docFolder.findFirst({ where: { id: folderId, userId: id }, include: { documents: true } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  const paths = owned.documents.map((d) => d.path);
  if (paths.length) await createAdminClient().storage.from(DOCS_BUCKET).remove(paths);
  await prisma.docFolder.delete({ where: { id: folderId } }); // documents cascade? no — SetNull; delete explicitly
  await prisma.document.deleteMany({ where: { userId: id, folderId } });
  revalidatePath("/documents");
  return { ok: true };
}

// ── Documents ──
export async function uploadDocument(formData: FormData): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const file = formData.get("file");
  const folderRaw = formData.get("folderId");
  const folderId = typeof folderRaw === "string" && folderRaw ? folderRaw : null;

  if (!(file instanceof File)) return { ok: false, error: "Không có file." };
  if (file.size === 0) return { ok: false, error: "File rỗng." };
  if (file.size > MAX_BYTES) return { ok: false, error: "File quá lớn (tối đa 25MB)." };
  if (!ALLOWED.some((re) => re.test(file.type))) return { ok: false, error: "Định dạng không được hỗ trợ." };

  if (folderId) {
    const owned = await prisma.docFolder.findFirst({ where: { id: folderId, userId: id } });
    if (!owned) return { ok: false, error: "Mục không hợp lệ." };
  }

  const docId = randomUUID();
  const path = `${id}/${docId}-${safeName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await createAdminClient().storage.from(DOCS_BUCKET).upload(path, buffer, {
    contentType: file.type, upsert: false,
  });
  if (error) return { ok: false, error: "Tải lên thất bại." };

  await prisma.document.create({
    data: { userId: id, folderId, name: file.name.slice(0, 200), path, mime: file.type, size: file.size },
  });
  revalidatePath("/documents");
  return { ok: true };
}

export async function deleteDocument(docId: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const doc = await prisma.document.findFirst({ where: { id: docId, userId: id } });
  if (!doc) return { ok: false, error: "Không tìm thấy." };
  await createAdminClient().storage.from(DOCS_BUCKET).remove([doc.path]);
  await prisma.document.delete({ where: { id: docId } });
  revalidatePath("/documents");
  return { ok: true };
}

export async function moveDocument(docId: string, folderId: string | null): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const doc = await prisma.document.findFirst({ where: { id: docId, userId: id } });
  if (!doc) return { ok: false, error: "Không tìm thấy." };
  if (folderId) {
    const owned = await prisma.docFolder.findFirst({ where: { id: folderId, userId: id } });
    if (!owned) return { ok: false, error: "Mục không hợp lệ." };
  }
  await prisma.document.update({ where: { id: docId }, data: { folderId } });
  revalidatePath("/documents");
  return { ok: true };
}

/** Signed URL để xem/tải một tài liệu (hết hạn sau 1 giờ). */
export async function getDocumentUrl(docId: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const doc = await prisma.document.findFirst({ where: { id: docId, userId: id } });
  if (!doc) return { ok: false, error: "Không tìm thấy." };
  const { data, error } = await createAdminClient().storage.from(DOCS_BUCKET).createSignedUrl(doc.path, 3600);
  if (error || !data) return { ok: false, error: "Không tạo được link." };
  return { ok: true, url: data.signedUrl };
}
