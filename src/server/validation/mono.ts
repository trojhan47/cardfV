import { z } from "zod";

export const monoBvnSchema = z.object({
  status: z.string(),
  data: z.object({
    full_name: z.string(),
    email: z.string().email(),
    gender: z.string(),
    lga_of_origin: z.string(),
    lga_of_residence: z.string(),
    marital_status: z.string(),
    nin: z.string(),
    nationality: z.string(),
    state_of_origin: z.string(),
    state_of_residence: z.string(),
    title: z.string(),
    first_name: z.string(),
    middle_name: z.string(),
    last_name: z.string(),
    registration_date: z.string(),
    enrollment_bank: z.string(),
    enrollment_branch: z.string(),
    phone: z.string(),
  }),
});

export type MonoBvnResponse = z.infer<typeof monoBvnSchema>;
