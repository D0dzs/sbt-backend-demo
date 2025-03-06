import { z } from "zod";

const SponsorSchema = z.object({
  sName: z.string({ required_error: "Név kötelező!" }).min(2),
  sWebUrl: z.string({ required_error: "Webcím kötelező!" }).url().min(2),
  sCategory: z.string({ required_error: "Kategória kötelező!" }),
});

type SponsorSchema = z.infer<typeof SponsorSchema>;

export default SponsorSchema;
