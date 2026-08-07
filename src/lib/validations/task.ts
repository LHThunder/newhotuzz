import { z } from "zod";

export const priorityEnum = z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]);
export const statusEnum = z.enum([
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "CANCELED",
]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(200),
  description: z.string().max(5000).optional(),
  priority: priorityEnum.default("NONE"),
  status: statusEnum.default("TODO"),
  dueDate: z.coerce.date().optional(),
  estimateMin: z.number().int().positive().optional(),
  projectId: z.string().cuid().optional(),
  goalId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
