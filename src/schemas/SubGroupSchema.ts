import { z } from "zod";

const SubGroupSchema = z.object({
  name: z.string({ required_error: "Név kötelező!" }).min(2).max(100),
  description: z.string({ required_error: "Leírás kötelező!" }).optional(),
  id: z.string({ required_error: "ID kötelező!" }),
  groupName: z.string({ required_error: "Csoport neve kötelező!" }).min(2).max(100),
});

type SubGroupSchema = z.infer<typeof SubGroupSchema>;

export default SubGroupSchema;
