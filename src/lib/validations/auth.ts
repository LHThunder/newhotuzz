import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
});

export const signupSchema = loginSchema.extend({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
