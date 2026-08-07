import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

/**
 * Ensures the signed-in Supabase auth user has a matching row in our Prisma
 * `User` table (id kept in sync with the Supabase auth uid), plus default
 * Settings. Call this in the authenticated layout. Returns null if not signed in.
 */
export async function ensureUser() {
  const authUser = await getUser();
  if (!authUser) return null;

  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: {
      id: authUser.id,
      email: authUser.email ?? `${authUser.id}@user.local`,
      name: (authUser.user_metadata?.name as string) ?? null,
      avatarUrl: (authUser.user_metadata?.avatar_url as string) ?? null,
      settings: { create: {} },
    },
  });

  return user;
}
