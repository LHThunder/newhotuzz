import { z } from "zod";

export const updateSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  accentColor: z.string().max(20).optional(),
  language: z.enum(["vi", "en", "fr"]).optional(),
  currency: z.enum(["VND", "EUR", "USD", "GBP", "JPY"]).optional(),
  location: z.string().max(80).nullish(),
  timezone: z.string().max(60).optional(),
  weekStartsOn: z.number().int().min(0).max(1).optional(),
  waterGoalMl: z.number().int().min(0).max(10000).optional(),
  sleepGoalMin: z.number().int().min(0).max(1440).optional(),
  focusGoalMin: z.number().int().min(0).max(1440).optional(),
  notifications: z.record(z.boolean()).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
