import { z } from "zod";

const UpdatePostSchema = z.object({
  postId: z.string(),
  title: z.string().min(2).max(100),
  content: z.string(),
  shortDesc: z.string().min(2).max(100),
});

type UpdatePostSchema = z.infer<typeof UpdatePostSchema>;

export { UpdatePostSchema };
