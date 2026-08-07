import { z } from "zod";

export const txTypeEnum = z.enum(["INCOME", "EXPENSE", "TRANSFER"]);

export const createTransactionSchema = z.object({
  type: txTypeEnum,
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  category: z.string().min(1, "Chọn danh mục"),
  note: z.string().max(200).optional(),
  accountId: z.string().cuid(),
  date: z.coerce.date().default(() => new Date()),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
