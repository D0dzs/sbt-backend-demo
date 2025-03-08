import { z } from "zod";

const AssignUserSubGroupFormSchema = z.object({
  id: z.string({ required_error: "Felhasználó azonosítója kötelező" }),
  subgroupname: z.string({ required_error: "Csoport neve kötelező" }),
  rolename: z.string({ required_error: "Szerepkör neve kötelező" }),
});

type AssignUserSubGroupFormSchema = z.infer<typeof AssignUserSubGroupFormSchema>;

export default AssignUserSubGroupFormSchema;
