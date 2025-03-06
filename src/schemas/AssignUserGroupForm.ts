import { z } from "zod";

const AssignUserGroupFormSchema = z.object({
  id: z.string({ required_error: "Felhasználó azonosítója kötelező" }),
  groupname: z.string({ required_error: "Csoport neve kötelező" }),
  rolename: z.string({ required_error: "Szerepkör neve kötelező" }),
});

type AssignUserGroupFormSchema = z.infer<typeof AssignUserGroupFormSchema>;

export default AssignUserGroupFormSchema;
