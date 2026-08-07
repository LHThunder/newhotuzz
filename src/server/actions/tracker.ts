"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

const title = z.string().min(1, "Không được để trống").max(200);

async function requireUser() {
  const user = await getUser();
  return user?.id ?? null;
}

export async function createProject(name: string): Promise<Result> {
  const uid = await requireUser();
  if (!uid) return { ok: false, error: "Chưa đăng nhập." };
  const parsed = title.safeParse(name);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0].message };
  await prisma.project.create({ data: { userId: uid, name: parsed.data } });
  revalidatePath("/projects");
  return { ok: true };
}

export async function createBook(t: string): Promise<Result> {
  const uid = await requireUser();
  if (!uid) return { ok: false, error: "Chưa đăng nhập." };
  const parsed = title.safeParse(t);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0].message };
  await prisma.book.create({ data: { userId: uid, title: parsed.data, status: "reading" } });
  revalidatePath("/books");
  return { ok: true };
}

export async function createMovie(t: string): Promise<Result> {
  const uid = await requireUser();
  if (!uid) return { ok: false, error: "Chưa đăng nhập." };
  const parsed = title.safeParse(t);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0].message };
  await prisma.movie.create({ data: { userId: uid, title: parsed.data, status: "watchlist" } });
  revalidatePath("/movies");
  return { ok: true };
}

export async function createCourse(t: string): Promise<Result> {
  return createLearningItem(t, "course");
}

const learningKinds = ["course", "video", "article", "book", "certificate"];

export async function createLearningItem(t: string, kind: string): Promise<Result> {
  const uid = await requireUser();
  if (!uid) return { ok: false, error: "Chưa đăng nhập." };
  const parsed = title.safeParse(t);
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0].message };
  const k = learningKinds.includes(kind) ? kind : "course";
  await prisma.course.create({ data: { userId: uid, title: parsed.data, kind: k, status: "learning" } });
  revalidatePath("/learning");
  return { ok: true };
}

export async function createBookmark(url: string): Promise<Result> {
  const uid = await requireUser();
  if (!uid) return { ok: false, error: "Chưa đăng nhập." };
  const parsed = z.string().min(1).max(500).safeParse(url);
  if (!parsed.success) return { ok: false, error: "URL không hợp lệ." };
  await prisma.bookmark.create({ data: { userId: uid, url: parsed.data } });
  revalidatePath("/brain");
  return { ok: true };
}
