"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };
const nonEmpty = z.string().min(1).max(200);

async function uid() {
  const u = await getUser();
  return u?.id ?? null;
}

// ─── Lists ────────────────────────────────────────────────
export async function createList(name: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const p = nonEmpty.safeParse(name); if (!p.success) return { ok: false, error: "Trống." };
  await prisma.list.create({ data: { userId: id, name: p.data } });
  revalidatePath("/lists");
  return { ok: true };
}

export async function deleteList(listId: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.list.findFirst({ where: { id: listId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.list.delete({ where: { id: listId } });
  revalidatePath("/lists");
  return { ok: true };
}

export async function addListItem(listId: string, title: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.list.findFirst({ where: { id: listId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  const p = nonEmpty.safeParse(title); if (!p.success) return { ok: false, error: "Trống." };
  await prisma.listItem.create({ data: { listId, userId: id, title: p.data } });
  revalidatePath("/lists");
  return { ok: true };
}

export async function toggleListItem(itemId: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const it = await prisma.listItem.findFirst({ where: { id: itemId, userId: id } });
  if (!it) return { ok: false, error: "Không có quyền." };
  await prisma.listItem.update({ where: { id: itemId }, data: { done: !it.done } });
  revalidatePath("/lists");
  return { ok: true };
}

export async function deleteListItem(itemId: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const it = await prisma.listItem.findFirst({ where: { id: itemId, userId: id } });
  if (!it) return { ok: false, error: "Không có quyền." };
  await prisma.listItem.delete({ where: { id: itemId } });
  revalidatePath("/lists");
  return { ok: true };
}

// ─── Contacts ─────────────────────────────────────────────
export async function createContact(name: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const p = nonEmpty.safeParse(name); if (!p.success) return { ok: false, error: "Trống." };
  await prisma.contact.create({ data: { userId: id, name: p.data } });
  revalidatePath("/contacts");
  return { ok: true };
}

export async function updateContact(contactId: string, data: { relationship?: string; company?: string; role?: string; contact?: string; notes?: string }): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.contact.findFirst({ where: { id: contactId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.contact.update({ where: { id: contactId }, data });
  revalidatePath("/contacts");
  return { ok: true };
}

export async function deleteContact(contactId: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.contact.findFirst({ where: { id: contactId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.contact.delete({ where: { id: contactId } });
  revalidatePath("/contacts");
  return { ok: true };
}

// ─── Board Games ──────────────────────────────────────────
export async function createBoardGame(name: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const p = nonEmpty.safeParse(name); if (!p.success) return { ok: false, error: "Trống." };
  await prisma.boardGame.create({ data: { userId: id, name: p.data } });
  revalidatePath("/board-games");
  return { ok: true };
}

export async function updateBoardGame(gameId: string, data: { rating?: number; timesPlayed?: number; owned?: boolean; favorite?: boolean; players?: string; playtime?: string }): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.boardGame.findFirst({ where: { id: gameId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.boardGame.update({ where: { id: gameId }, data });
  revalidatePath("/board-games");
  return { ok: true };
}

export async function deleteBoardGame(gameId: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.boardGame.findFirst({ where: { id: gameId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.boardGame.delete({ where: { id: gameId } });
  revalidatePath("/board-games");
  return { ok: true };
}

// ─── Achievements ─────────────────────────────────────────
export async function createAchievement(title: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const p = nonEmpty.safeParse(title); if (!p.success) return { ok: false, error: "Trống." };
  await prisma.achievement.create({ data: { userId: id, key: crypto.randomUUID(), title: p.data } });
  revalidatePath("/achievements");
  return { ok: true };
}

export async function deleteAchievement(achId: string): Promise<Result> {
  const id = await uid(); if (!id) return { ok: false, error: "Chưa đăng nhập." };
  const owned = await prisma.achievement.findFirst({ where: { id: achId, userId: id } });
  if (!owned) return { ok: false, error: "Không có quyền." };
  await prisma.achievement.delete({ where: { id: achId } });
  revalidatePath("/achievements");
  return { ok: true };
}
