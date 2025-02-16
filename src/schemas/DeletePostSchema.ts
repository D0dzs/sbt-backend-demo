import { z } from "zod";

const DeletePostSchema = z.object({
  postId: z.string({ message: "Missing post ID" }),
});
type DeletePostSchema = z.infer<typeof DeletePostSchema>;

export default DeletePostSchema;
