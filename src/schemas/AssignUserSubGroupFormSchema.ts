import { z } from "zod";

const AssignUserSubGroupFormSchema = z.object({
  firstName: z.string({ required_error: "Vezetéknév kötelező" }),
  lastName: z.string({ required_error: "Keresztnév kötelező" }),
  subgroupname: z.string({ required_error: "Csoport neve kötelező" }),
  rolename: z.string({ required_error: "Szerepkör neve kötelező" }),
});

type AssignUserSubGroupFormSchema = z.infer<typeof AssignUserSubGroupFormSchema>;

export default AssignUserSubGroupFormSchema;
