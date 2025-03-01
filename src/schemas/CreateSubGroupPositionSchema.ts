import { z } from "zod";

const CreateSubGroupPositionSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(2),
  subGroupName: z.string({ required_error: "Subgroup name is required" }).min(2),
});

type CreateSubGroupPositionSchema = z.infer<typeof CreateSubGroupPositionSchema>;

export default CreateSubGroupPositionSchema;
