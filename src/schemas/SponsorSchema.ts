import { z } from "zod";

const SponsorSchema = z.object({
  sName: z.string().min(2),
  sWebUrl: z.string().url().min(2),
  sCategory: z.string(),
});

type SponsorSchema = z.infer<typeof SponsorSchema>;

export default SponsorSchema;
