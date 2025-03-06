import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email({ message: "Hibás emailcím vagy jelszó!" }),
  password: z.string(),
});

type LoginSchema = z.infer<typeof LoginSchema>;

export default LoginSchema;
