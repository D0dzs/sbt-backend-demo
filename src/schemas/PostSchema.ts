import { z } from "zod";

const PostSchema = z.object({
  title: z
    .string({ message: "Cím kötelező!" })
    .min(2, { message: "Címnek legalább 2 karakter hosszúnak kell lennie!" }),
  content: z.string({ message: "Poszt tartalma kötelező!" }),
  shortDesc: z.string({ message: "Rövid leírás kötelező!" }).max(100, {
    message: "A rövid leírásnak kevesebb mint 100 karakterből kell állnia!",
  }),
});

type PostSchema = z.infer<typeof PostSchema>;

export default PostSchema;
