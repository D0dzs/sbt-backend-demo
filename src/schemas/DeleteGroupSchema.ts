import { z } from "zod";

const DeleteGroupSchema = z.object({
  id: z.string({ required_error: "ID is required to be filled out!" }),
});

type DeleteGroupSchema = z.infer<typeof DeleteGroupSchema>;

export default DeleteGroupSchema;
