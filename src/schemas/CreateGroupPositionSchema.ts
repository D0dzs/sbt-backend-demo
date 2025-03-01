import { z } from "zod";

const CreateGroupPositionSchema = z.object({
  groupName: z.string({ required_error: "Group name is required" }).min(2).max(100),
  roleName: z.string({ required_error: "Role name is required" }).min(2).max(100),
});

type CreateGroupPositionSchema = z.infer<typeof CreateGroupPositionSchema>;

export default CreateGroupPositionSchema;
