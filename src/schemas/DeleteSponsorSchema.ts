import { z } from "zod";

const DeleteSponsorSchema = z.object({
  id: z.string({ required_error: "ID is required" }),
});

type DeleteSponsorSchema = z.infer<typeof DeleteSponsorSchema>;

export default DeleteSponsorSchema;
