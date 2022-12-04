import { z } from "zod";

export const accentColorSchema = z.enum([
  "blue",
  "pink",
  "green",
  "orange",
  "violet",
]);

export const userSchema = z.object({
  id: z.string().uuid(),
  handle: z.string(),
  name: z.string(),
  accentColor: accentColorSchema,
});
