import { z } from "zod";

const ChangeRoleSchema = z.object({
  email: z.string().email(),
  newRole: z.enum(["admin", "writer"], { required_error: "Role is required", invalid_type_error: "Invalid role type" }),
});

type ChangeRoleSchema = z.infer<typeof ChangeRoleSchema>;

export default ChangeRoleSchema;
