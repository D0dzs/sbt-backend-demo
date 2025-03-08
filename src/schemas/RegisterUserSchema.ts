import { z } from "zod";

const RegisterUserSchema = z.object({
  email: z.string({ required_error: "Az e-mail cím kitöltése kötelező!!" }).email(),
  firstName: z.string({ required_error: "Vezetéknév kötelező!" }),
  lastName: z.string({ required_error: "Vezetéknév kötelező!" }),
  password: z
    .string({ required_error: "Jelszó kötelező!" })
    .min(6, { message: "Jelszónak legalább 6 karakter hosszú!" })

    // RegEx: https://github.com/RedBit-devs/RedBit/wiki/API
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/, {
      message: "A jelszó nem megfelelő! Tartalmaznia kell kis- és nagybetűt, számot és speciális karaktert! ",
    }),
  role: z.string({ required_error: "Szerepkör kötelező!" }).min(1),
});

type RegisterUserSchema = z.infer<typeof RegisterUserSchema>;

export default RegisterUserSchema;
