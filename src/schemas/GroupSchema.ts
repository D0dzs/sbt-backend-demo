import { z } from "zod";

const GroupSchema = z.object({
  name: z
    .string({ required_error: "Név kötelező!" })
    .min(2, { message: "Csoport neve legalább 2 karakternél többnek kell lennie!" })
    .max(100, { message: "Csoport neve maximum 100 karakternél kevesebbnek kell lennie!" }),
  description: z.string().optional(),
  firstName: z.string({ required_error: "Keresztnév kötelező!" }),
  lastName: z.string({ required_error: "Vezetéknév kötelező!" }),
});

type GroupSchema = z.infer<typeof GroupSchema>;

export default GroupSchema;
