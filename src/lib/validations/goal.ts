import { z } from "zod";

export const horizonEnum = z.enum([
  "VISION", "LIFE", "YEAR", "QUARTER", "MONTH", "WEEK", "DAY",
]);

export const createGoalSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(200),
  description: z.string().max(2000).optional(),
  horizon: horizonEnum.default("YEAR"),
  deadline: z.coerce.date().optional(),
  parentId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  targetValue: z.number().optional(),
  unit: z.string().max(20).optional(),
});

export const updateProgressSchema = z.object({
  id: z.string().cuid(),
  progress: z.number().int().min(0).max(100),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
