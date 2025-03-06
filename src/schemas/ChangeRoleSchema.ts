import { z } from "zod";

const ChangeRoleSchema = z.object({
  id: z.string({ required_error: "Felhasználó azonosító kötelező", invalid_type_error: "Invalid user ID type" }),
  newRole: z.enum(["admin", "writer"], {
    required_error: "Szerepkör kötelező",
    invalid_type_error: "Invalid role type",
  }),
});

type ChangeRoleSchema = z.infer<typeof ChangeRoleSchema>;

export default ChangeRoleSchema;
