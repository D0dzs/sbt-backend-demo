import { z } from "zod";

const ChangePasswordSchema = z.object({
  email: z.string().email(),
  password: z
    .string({ required_error: "New password is required" })
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100),
});

type ChangePasswordSchema = z.infer<typeof ChangePasswordSchema>;

export default ChangePasswordSchema;
