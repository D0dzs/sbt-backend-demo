import { z } from "zod";

const AddUserGroupPositionSchema = z.object({
  userId: z.string({ required_error: "Felhasználó azonosítója kötelező" }),
  groupId: z.string({ required_error: "Csoport azonosítója kötelező" }),
  positionId: z.string({ required_error: "Pozíció azonosítója kötelező" }),
});

type AddUserGroupPositionSchema = z.infer<typeof AddUserGroupPositionSchema>;

export default AddUserGroupPositionSchema;
