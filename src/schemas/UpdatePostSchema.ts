import { z } from "zod";

const UpdatePostSchema = z.object({
  postId: z.string({ required_error: "Az id kötelező!" }),
  title: z.string({ required_error: "Cím kötelező!" }).min(2).max(100),
  content: z.string({ required_error: "Tartalom kötelező!" }),
  shortDesc: z
    .string({ required_error: "Rövid leírás kötelező!" })
    .min(2, { message: "Minimum 2 karakter" })
    .max(100, { message: "Maximum 100 karakter" }),
});

type UpdatePostSchema = z.infer<typeof UpdatePostSchema>;

export default UpdatePostSchema;
