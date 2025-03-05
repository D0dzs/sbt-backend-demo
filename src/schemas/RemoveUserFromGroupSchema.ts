import { z } from "zod";

const RemoveUserFromGroupSchema = z.object({
  firstName: z.string({ required_error: "First name is required" }),
  lastName: z.string({ required_error: "Last name is required" }),
  group: z.string({ required_error: "Group is required" }),
  isItSubGroup: z.boolean(),
});
type RemoveUserFromGroupSchema = z.infer<typeof RemoveUserFromGroupSchema>;

export default RemoveUserFromGroupSchema;
