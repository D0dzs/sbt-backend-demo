import { z } from "zod";

const User = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  firstName: z.string(),
  lastName: z.string(),
});

type User = z.infer<typeof User>;

export { User };
