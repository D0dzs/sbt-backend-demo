import { z } from "zod";

const AddUserGroupPositionSchema = z.object({
  userId: z.string({ required_error: "User ID is required" }),
  groupId: z.string({ required_error: "Group ID is required" }),
  positionId: z.string({ required_error: "Position ID is required" }),
});

type AddUserGroupPositionSchema = z.infer<typeof AddUserGroupPositionSchema>;

export default AddUserGroupPositionSchema;
