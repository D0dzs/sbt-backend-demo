import { z } from "zod";

const DeleteSponsorSchema = z.object({
  id: z.string({ required_error: "ID kötelező!" }),
});

type DeleteSponsorSchema = z.infer<typeof DeleteSponsorSchema>;

export default DeleteSponsorSchema;
