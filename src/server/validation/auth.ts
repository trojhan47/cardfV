import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  pin: z.string(),
});

export type ILogin = z.infer<typeof loginSchema>;
