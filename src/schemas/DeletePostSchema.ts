import { z } from "zod";

const DeletePostSchema = z.object({
  postId: z.string({ message: "ID kötelező!" }),
});
type DeletePostSchema = z.infer<typeof DeletePostSchema>;

export default DeletePostSchema;
