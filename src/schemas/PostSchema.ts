import { z } from "zod";

const Post = z.object({
  title: z
    .string({ message: "Title field is required to be filled out!" })
    .min(2, { message: "Title should me more than 2 characters long!" }),
  content: z.string({ message: "Content field is required to be filled out!" }),
  shortDesc: z.string({ message: "Short Description is required to be fulled out!" }).max(100, {
    message: "Short description must be less than 100 characters",
  }),
});

type Post = z.infer<typeof Post>;

export { Post };
