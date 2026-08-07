import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

/**
 * Ensures the signed-in Supabase auth user has a matching Prisma `User` row
 * (+ default Settings), and returns it WITH settings included.
 *
 * Read-first: a plain findUnique on the hot path (fast, no write); only the
 * very first login performs an insert. Returning settings here lets the layout
 * and pages avoid a second round trip.
 */
export async function ensureUser() {
  const authUser = await getUser();
  if (!authUser) return null;

  const existing = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { settings: true },
  });

  if (existing) {
    if (existing.settings) return existing;
    // User exists but has no settings row yet — create it once.
    const settings = await prisma.settings.create({ data: { userId: existing.id } });
    return { ...existing, settings };
  }

  return prisma.user.create({
    data: {
      id: authUser.id,
      email: authUser.email ?? `${authUser.id}@user.local`,
      name: (authUser.user_metadata?.name as string) ?? null,
      avatarUrl: (authUser.user_metadata?.avatar_url as string) ?? null,
      settings: { create: {} },
    },
    include: { settings: true },
  });
}
