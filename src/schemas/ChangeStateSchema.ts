import { z } from "zod";

const ChangeStateSchema = z.object({
  id: z.string({ required_error: "Felhasználó azonosító kötelező" }),
  firstName: z.string({ required_error: "Keresztnév kötelező" }),
  lastName: z.string({ required_error: "Vezetéknév kötelező" }),
});

type ChangeStateSchema = z.infer<typeof ChangeStateSchema>;

export default ChangeStateSchema;
