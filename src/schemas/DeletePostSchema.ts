import { z } from "zod";

const DeletePostSchema = z.object({
  postId: z.string(),
});
type DeletePostSchema = z.infer<typeof DeletePostSchema>;

export default DeletePostSchema;
