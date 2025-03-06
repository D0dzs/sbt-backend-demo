import { z } from "zod";

const RemoveUserFromGroupSchema = z.object({
  firstName: z.string({ required_error: "Vezetéknév kötelező!" }),
  lastName: z.string({ required_error: "Keresztnév kötelező!" }),
  group: z.string({ required_error: "Csoport kötelező!" }),
  isItSubGroup: z.boolean(),
});
type RemoveUserFromGroupSchema = z.infer<typeof RemoveUserFromGroupSchema>;

export default RemoveUserFromGroupSchema;
