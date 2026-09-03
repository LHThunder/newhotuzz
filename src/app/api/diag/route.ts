import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Temporary diagnostic endpoint. Reports env presence, DB reachability, and
 * whether the Supabase auth client + the layout's user query work — each step
 * isolated so a failure is pinpointed. Remove after use.
 */
export async function GET() {
  const env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    DIRECT_URL: !!process.env.DIRECT_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  let db = "not-tested";
  try { await prisma.$queryRaw`SELECT 1`; db = "ok"; }
  catch (e) { db = "ERROR: " + (e as Error).message.slice(0, 300); }

  let supabase = "not-tested";
  try { const c = await createClient(); await c.auth.getUser(); supabase = "ok"; }
  catch (e) { supabase = "ERROR: " + (e as Error).message.slice(0, 300); }

  let userQuery = "not-tested";
  try {
    const u = await prisma.user.findFirst({ include: { settings: true } });
    userQuery = u ? `ok (settings=${u.settings ? "yes" : "null"})` : "ok (no users)";
  } catch (e) { userQuery = "ERROR: " + (e as Error).message.slice(0, 300); }

  let taskQuery = "not-tested";
  try {
    const u = await prisma.user.findFirst();
    if (u) { await prisma.task.findMany({ where: { userId: u.id, archivedAt: null }, include: { subtasks: true, tags: true, project: true }, take: 3 }); }
    taskQuery = "ok";
  } catch (e) { taskQuery = "ERROR: " + (e as Error).message.slice(0, 300); }

  return Response.json({ env, db, supabase, userQuery, taskQuery, node: process.version });
}
