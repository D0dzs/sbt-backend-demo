import { z } from "zod";

const ChangeStateSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email(),
  state: z.boolean(),
});

type ChangeStateSchema = z.infer<typeof ChangeStateSchema>;

export default ChangeStateSchema;
