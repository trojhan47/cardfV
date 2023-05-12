import * as z from "zod";

export const registerSchema = z.object({
  userType: z.enum(["INDIVIDUAL", "COMPANY"]),
  companyName: z.string(),
  companyCac: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dob: z.string(),
  phoneNumber: z.string(),
  email: z.string(),
  address1: z.string(),
  address2: z.string(),
  city: z.string(),
  postalCode: z.string(),
  state: z.string(),
  country: z.string(),
  pin: z.string(),
});

export type IRegister = z.infer<typeof registerSchema>;
