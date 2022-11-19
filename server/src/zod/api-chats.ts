import { z } from "zod";
import { userSchema } from "./schemas";

export const countSchema = z.object({
  messages: z.number(),
  members: z.number(),
});

export const creatorSchema = z.object({
  handle: z.string(),
});

export type UserSchemaType = z.infer<typeof userSchema>;

// Fetch chats

export const chatSchemaPrimitive = z.object({
  name: z.string().nullable(),
  id: z.string().uuid(),
  latest: z.string(),
  description: z.string().nullable(),
  inviteCode: z.string().nullable(),
  createdAt: z.string(),
  type: z.enum(["DM", "GROUP"]),
  isPublic: z.boolean(),
  creatorId: z.string().nullable(),
  creator: userSchema.nullable(),
  _count: countSchema,
  members: z.array(userSchema),
});

export type ChatSchemaPrimitiveType = z.infer<typeof chatSchemaPrimitive>;
export const chatsSchemaPrimitive = z.array(chatSchemaPrimitive);

export const chatSchema = chatSchemaPrimitive.extend({
  latest: z.date(),
  createdAt: z.date(),
});

export type ChatSchemaType = z.infer<typeof chatSchema>;

export const chatsSchema = z.array(chatSchema);
