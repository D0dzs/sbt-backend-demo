import { z } from "zod";

const GroupSchema = z.object({
  name: z
    .string({ required_error: "Name is required to be filled out!!" })
    .min(2, { message: "Name must be more than 2 characters!" })
    .max(100, { message: "Name must less than 100 characters!" }),
  description: z.string({ required_error: "Description is required to be filled out!" }).optional(),
  leaderName: z.string({ required_error: "Leader is required to be filled out!" }),
});

type GroupSchema = z.infer<typeof GroupSchema>;

export default GroupSchema;
