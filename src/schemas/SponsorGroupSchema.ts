import { z } from "zod";

const SponsorGroupSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(2).max(100),
});

type SponsorGroupSchema = z.infer<typeof SponsorGroupSchema>;

export default SponsorGroupSchema;
