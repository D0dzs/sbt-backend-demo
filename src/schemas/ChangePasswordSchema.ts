import { z } from "zod";

const ChangePasswordSchema = z.object({
  id: z.string({ required_error: "Felhasználó azonosító kötelező" }),
  password: z
    .string({ required_error: "Új jelszó kötelező" })
    .min(6, { message: "Jelszó legalább 6 karakter hosszú kell legyen" })
    .max(100),
});

type ChangePasswordSchema = z.infer<typeof ChangePasswordSchema>;

export default ChangePasswordSchema;
