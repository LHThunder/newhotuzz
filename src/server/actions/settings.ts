"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { settingsService } from "@/server/services/settings.service";
import { updateSettingsSchema } from "@/lib/validations/settings";

type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function updateSettings(input: unknown): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Chưa đăng nhập." };

  const parsed = updateSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dữ liệu không hợp lệ." };

  const data = await settingsService.update(user.id, parsed.data);
  revalidatePath("/settings");
  revalidatePath("/");
  return { ok: true, data };
}
