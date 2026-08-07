"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

type ActionResult = { ok: false; error: string } | { ok: true };

export async function signIn(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: error.message };
  redirect("/");
}

export async function signUp(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { name: parsed.data.name } },
  });
  if (error) return { ok: false, error: error.message };
  redirect("/onboarding");
}

export async function signInWithOAuth(provider: "google" | "github") {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
  });
  if (error) return { ok: false as const, error: error.message };
  if (data.url) redirect(data.url);
  return { ok: true as const };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
