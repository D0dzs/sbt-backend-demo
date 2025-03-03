import { z } from "zod";

const AssignUserGroupFormSchema = z.object({
  username: z.string({ required_error: "User is required" }),
  groupname: z.string({ required_error: "Group name is required" }),
  rolename: z.string({ required_error: "Role name is required" }),
});

type AssignUserGroupFormSchema = z.infer<typeof AssignUserGroupFormSchema>;

export default AssignUserGroupFormSchema;
