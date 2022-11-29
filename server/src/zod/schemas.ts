import { z } from "zod";

// Base data (Websockets messages)
export const baseDataSchema = z.object({
  dataType: z.enum([
    // messages
    "add-message",
    "delete-message",
    // user settings
    "update-user-settings",
    "error-user-info",
    "set-user-info",
    // dms
    "create-dm",
    // groups
    "create-group",
    "update-group",
    "delete-group",
    "remove-member",
    // invite codes,
    "regen-invite",
    "set-invite",
    // requests
    "send-request",
    "ack-request",
    "error-request",
    "add-request",
    "remove-request",
    // update image
    "update-image",
  ]),
});

//---------------------------------------------------------------

export const currentUserSchema = z.object({
  id: z.string().uuid(),
  handle: z.string(),
  name: z.string(),
});

export const userSchema = z.object({
  id: z.string().uuid(),
  handle: z.string(),
  name: z.string(),
});

export const userPassportSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  handle: z.string(),
});

// Update user settings
// CLIENT -> SERVER
export const updateUserSettingsSchema = baseDataSchema.extend({
  name: z.string(),
  handle: z.string(),
  image: z.string().optional(),
});

// Update user info error
// SERVER -> CLIENT
export const errorUserInfoSchema = baseDataSchema.extend({
  nameError: z.string(),
  handleError: z.string(),
});

// Set updated user info
// SERVER -> CLIENT
export const setUserInfoSchema = baseDataSchema.extend({
  userId: z.string().uuid(),
  name: z.string(),
  handle: z.string(),
});

//---------------------------------------------------------------

// Chat messages
// CLIENT -> SERVER
// SERVER -> CLIENT
export const addMessageSchema = baseDataSchema.extend({
  userId: z.string().uuid(),
  chatId: z.string().uuid(),
  content: z.string(),
});

// Delete message
// CLIENT -> SERVER
// SERVER -> CLIENT
export const deleteMessageSchema = baseDataSchema.extend({
  messageId: z.string().uuid(),
  chatId: z.string().uuid(),
  authorId: z.string().uuid(),
});

export type deleteMessageSchemaType = z.infer<typeof deleteMessageSchema>;

//---------------------------------------------------------------

//---------------------------------------------------------------

// Create a new group
export const createGroupSchema = baseDataSchema.extend({
  name: z.string(),
  description: z.string(),
  isPublic: z.boolean(),
  image: z.string().url(),
});

// Update group info
// CLIENT -> SERVER
// SERVER -> CLIENT
export const updateGroupSchema = baseDataSchema.extend({
  groupId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  isPublic: z.boolean(),
  image: z.string().url().optional(),
});

// Delete group
// CLIENT -> SERVER
// SERVER -> CLIENT
export const deleteGroupSchema = baseDataSchema.extend({
  groupId: z.string().uuid(),
});

// Regenerate invite code
// CLIENT -> SERVER
export const regenInviteSchema = baseDataSchema.extend({
  groupId: z.string().uuid(),
});

// Set new invite code
// SERVER -> CLIENT
export const setInviteSchema = baseDataSchema.extend({
  groupId: z.string().uuid(),
  inviteCode: z.string(),
});

// Remove member from group
// CLIENT -> SERVER
// SERVER -> CLIENT
export const removeMemberSchema = baseDataSchema.extend({
  memberId: z.string().uuid(),
  groupId: z.string().uuid(),
});

//---------------------------------------------------------------

// Send request
// CLIENT -> SERVER
export const sendRequestSchema = baseDataSchema.extend({
  handle: z.string(),
});

// Acknowledge request
export const ackRequestSchema = baseDataSchema.extend({});

// Error
export const errorRequestSchema = baseDataSchema.extend({
  error: z.string(),
});

// Add request
// SERVER -> CLIENT
export const addRequestSchema = baseDataSchema.extend({
  requestId: z.string().uuid(),
  createdAt: z.date(),
  senderId: z.string().uuid(),
  senderHandle: z.string(),
  senderName: z.string(),
  receiverId: z.string().uuid(),
  receiverHandle: z.string(),
  receiverName: z.string(),
});

// Remove request
// CLIENT -> SERVER
// SERVER -> CLIENT
export const removeRequestSchema = baseDataSchema.extend({
  requestId: z.string().uuid(),
  action: z.enum(["accept", "reject"]),
});

//---------------------------------------------------------------

// Update profile picture
// SERVER -> CLIENT
export const updateImageSchema = baseDataSchema.extend({
  id: z.string().uuid(),
  objectType: z.enum(["user", "group"]),
});
