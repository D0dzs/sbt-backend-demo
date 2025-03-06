import { z } from "zod";

const UserSchema = z.object({
  email: z.string({ required_error: "Az e-mail cím kitöltése kötelező!" }).email(),
  password: z
    .string({ required_error: "Jelszó kötelező!" })
    .min(6, { message: "Jelszó legalább 6 karakter hosszúnak kell lennie!" }),
  firstName: z.string({ required_error: "Vezetéknév kötelező!" }),
  lastName: z.string({ required_error: "Keresztnév kötelező!" }),
  // avatarURL: z.string({ required_error: "Avatar URL kötelező!" }),
});

type UserSchema = z.infer<typeof UserSchema>;

export default UserSchema;
