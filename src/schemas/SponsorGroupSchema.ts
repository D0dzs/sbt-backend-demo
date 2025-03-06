import { z } from "zod";

const SponsorGroupSchema = z.object({
  name: z.string({ required_error: "Név kötelező!" }).min(2).max(100),
});

type SponsorGroupSchema = z.infer<typeof SponsorGroupSchema>;

export default SponsorGroupSchema;
