import { z } from "zod";

const DeleteGroupSchema = z.object({
  id: z.string({ required_error: "ID kötelező!" }),
});

type DeleteGroupSchema = z.infer<typeof DeleteGroupSchema>;

export default DeleteGroupSchema;
