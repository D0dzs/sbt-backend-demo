import { z } from "zod";

const AddUserGroupPositionSchema = z.object({
  userId: z.string({ required_error: "User ID is required" }).uuid(),
  groupId: z.string({ required_error: "Group ID is required" }).uuid(),
  positionId: z.string({ required_error: "Position ID is required" }).uuid(),
});

type AddUserGroupPositionSchema = z.infer<typeof AddUserGroupPositionSchema>;

export default AddUserGroupPositionSchema;
