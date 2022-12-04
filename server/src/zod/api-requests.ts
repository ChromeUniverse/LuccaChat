import { z } from "zod";
import { userSchema } from "./user";

// [
//   {
//     "id": "63abde79-d3ec-4730-bd41-ebae71db338f",
//     "createdAt": "2022-11-19T15:57:25.945Z",
//     "sender": {
//       "id": "26301cf0-fd71-4758-a091-f60a0ccf0e6d",
//       "name": "User 1",
//       "handle": "user1"
//     }
//   }
// ]

export const requestSchemaPrimitive = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  sender: userSchema,
});

export const requestArraySchemaPrimitive = z.array(requestSchemaPrimitive);

export const requestSchema = requestSchemaPrimitive.extend({
  createdAt: z.date(),
});

export type requestSchemaType = z.infer<typeof requestSchema>;

export const requestArraySchema = z.array(requestSchema);
