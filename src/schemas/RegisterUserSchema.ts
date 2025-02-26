import { z } from "zod";

const RegisterUserSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email(),
  firstName: z.string({ required_error: "First name is required" }),
  lastName: z.string({ required_error: "Last name is required" }),
  password: z.string({ required_error: "Password is required" }),
  role: z.string({ required_error: "Role is required" }).min(1),
});

type RegisterUserSchema = z.infer<typeof RegisterUserSchema>;

export default RegisterUserSchema;
