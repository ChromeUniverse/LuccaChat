import { z } from "zod";

// Base data (Websockets messages)
export const baseDataSchema = z.object({
  type: z.enum([
    // messages
    "add-message",
    "delete-message",
    // dms
    // ...
    // groups
    "remove-user",
    "remove-group",
    // requests
    "send-request",
    "add-request",
    "remove-request",
  ]),
});

//---------------------------------------------------------------

export const userSchema = z.object({
  id: z.string().uuid(),
  handle: z.string(),
  name: z.string(),
});

//---------------------------------------------------------------

// Chat messages
export const addMessageSchema = baseDataSchema.extend({
  userId: z.string().uuid(),
  chatId: z.string().uuid(),
  content: z.string(),
});

// Delete message
export const deleteMessageSchema = baseDataSchema.extend({
  messageId: z.string().uuid(),
  chatId: z.string().uuid(),
  authorId: z.string().uuid(),
});

export type deleteMessageSchemaType = z.infer<typeof deleteMessageSchema>;

//---------------------------------------------------------------

// export const createDmSchema = baseDataSchema.extend({
//   chatId: z.string().uuid(),
//   members: z.array(userSchema).length(2),
// });

//---------------------------------------------------------------

// Update group info
export const updateGroupSchema = baseDataSchema.extend({
  groupId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  isPublic: z.boolean(),
});

// Regenerate invite code
export const regenInvite = baseDataSchema.extend({});

// Set new invite code
export const setInvite = baseDataSchema.extend({
  inviteCode: z.string().uuid(),
});

// Create group
// export const createGroupSchema = baseDataSchema.extend({
//   chatId: z.string().uuid(),
//   name: z.string(),
//   creatorId: z.string().uuid(),
//   description: z.string(),
//   isPublic: z.boolean(),
//   inviteCode: z.string(),
//   createdAt: z.date();
// });

// Remove member from group
export const removeMemberSchema = baseDataSchema.extend({
  userId: z.string().uuid(),
  groupId: z.string().uuid(),
});

// Remove group
export const removeGroupSchema = baseDataSchema.extend({
  groupId: z.string().uuid(),
});

//---------------------------------------------------------------

// Send request
export const sendRequestSchema = baseDataSchema.extend({
  senderId: z.string().uuid(),
  handle: z.string(),
});

// Add request
export const addRequestSchema = baseDataSchema.extend({
  requestId: z.string().uuid(),
  senderId: z.string().uuid(),
  senderHandler: z.string(),
  receiverId: z.string().uuid(),
  receiverHandler: z.string(),
});

// Remove request
export const removeRequestSchema = baseDataSchema.extend({
  requestId: z.string().uuid(),
  action: z.enum(["accept", "reject"]),
});
