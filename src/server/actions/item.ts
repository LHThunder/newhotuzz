"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

async function uid() {
  const u = await getUser();
  return u?.id ?? null;
}

export async function updateBook(
  id: string,
  data: { status?: string; rating?: number; currentPage?: number },
): Promise<Result> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.book.findFirst({ where: { id, userId } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.book.update({ where: { id }, data });
  revalidatePath("/books");
  return { ok: true };
}

export async function updateMovie(
  id: string,
  data: { status?: string; rating?: number },
): Promise<Result> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.movie.findFirst({ where: { id, userId } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.movie.update({ where: { id }, data });
  revalidatePath("/movies");
  return { ok: true };
}

export async function updateCourse(
  id: string,
  data: { progress?: number; status?: string },
): Promise<Result> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.course.findFirst({ where: { id, userId } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  const status = data.progress != null ? (data.progress >= 100 ? "done" : "learning") : data.status;
  await prisma.course.update({ where: { id }, data: { ...data, ...(status ? { status } : {}) } });
  revalidatePath("/learning");
  return { ok: true };
}

/** Generic delete with ownership check, for list items. */
export async function deleteRecord(
  type: "book" | "movie" | "course" | "project" | "note" | "journal" | "health",
  id: string,
): Promise<Result> {
  const userId = await uid();
  if (!userId) return { ok: false, error: "Chưa đăng nhập." };

  const map = {
    book: () => prisma.book,
    movie: () => prisma.movie,
    course: () => prisma.course,
    project: () => prisma.project,
    note: () => prisma.note,
    journal: () => prisma.journalEntry,
    health: () => prisma.healthMetric,
  } as const;

  const model = map[type]() as { findFirst: Function; delete: Function };
  const owned = await model.findFirst({ where: { id, userId } });
  if (!owned) return { ok: false, error: "Không tìm thấy." };
  await model.delete({ where: { id } });

  const paths: Record<string, string> = {
    book: "/books", movie: "/movies", course: "/learning",
    project: "/projects", note: "/brain", journal: "/journal", health: "/health",
  };
  revalidatePath(paths[type]);
  return { ok: true };
}
