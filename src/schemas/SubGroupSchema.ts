import { z } from "zod";
// name: '',
// description: '',
// leaderName: '',
// groupName: '',
const SubGroupSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(2).max(100),
  description: z.string({ required_error: "Description is required" }).min(2).max(1000),
  leaderName: z.string({ required_error: "Leader name is required" }).min(2).max(100),
  groupName: z.string({ required_error: "Group name is required" }).min(2).max(100),
});

type SubGroupSchema = z.infer<typeof SubGroupSchema>;

export default SubGroupSchema;
