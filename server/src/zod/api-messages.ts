import { z } from "zod";

export const messageSchemaPrimitive = z.object({
  id: z.string().uuid(),
  chatId: z.string().uuid(),
  author: z.object({
    id: z.string().uuid(),
    handle: z.string(),
    name: z.string(),
  }),
  content: z.string(),
  createdAt: z.string(),
});

export const messagesSchemaPrimitive = z.array(messageSchemaPrimitive);

export const messageSchema = messageSchemaPrimitive.extend({
  createdAt: z.date(),
});

export type messageSchemaType = z.infer<typeof messageSchema>;

export const messagesSchema = z.array(messageSchema);
