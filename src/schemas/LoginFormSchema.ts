import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address!" }),
  password: z.string(),
});

type LoginSchema = z.infer<typeof LoginSchema>;

export default LoginSchema;
