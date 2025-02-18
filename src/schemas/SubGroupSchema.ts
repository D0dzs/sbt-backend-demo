import { z } from "zod";

const SubGroupSchema = z.object({
  name: z
    .string({ required_error: "Name field is required to be filled out!" })
    .min(2, { message: "Name must be more than 2 characters!" })
    .max(100, { message: "Name must less than 100 characters!" }),
  groupName: z.string({ required_error: "GroupName field is required to create a sub-group!" }),
});

type SubGroupSchema = z.infer<typeof SubGroupSchema>;

export default SubGroupSchema;
