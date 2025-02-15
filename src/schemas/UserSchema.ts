import { z } from "zod";

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  firstName: z.string(),
  lastName: z.string(),
});

type UserSchema = z.infer<typeof UserSchema>;

export default UserSchema;
