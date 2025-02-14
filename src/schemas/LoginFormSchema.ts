import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type LoginSchema = z.infer<typeof LoginSchema>;

export { LoginSchema };
