import { z } from "zod";

const AssignUserSubGroupFormSchema = z.object({
  username: z.string({ required_error: "User is required" }),
  subgroupname: z.string({ required_error: "Group name is required" }),
  rolename: z.string({ required_error: "Role name is required" }),
});

type AssignUserSubGroupFormSchema = z.infer<typeof AssignUserSubGroupFormSchema>;

export default AssignUserSubGroupFormSchema;
