import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { currentUserSchema } from "../zod/schemas";
import { isLoggedIn } from "../middleware/login";
import { messageSchema } from "../zod/api-messages";

// Express router config
const api = express.Router();
api.use(express.json());

// Prisma setup
const prisma = new PrismaClient();

api.get("/", (req, res) => {
  res.send("Hello World!");
});

// Routes
//
// GET
// [ ] /api/user                        -> returns user information for current user
// [ ] /api/users/:userId               -> return inframtion for a specific user
// [ ] /api/chats                       -> fetches basic chats info for a user
// [ ] /api/chats/:chatId/messages      -> fetches all messsages for a specific chat
// [ ] /api/chats/:chatId/members       -> fetches member for a specific chat
// [ ] /api/requests                    -> returns unacknowledged requests
//

api.get("/user", isLoggedIn, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.currentUser.id },
  });

  if (!user) return res.sendStatus(404);

  const dataToSend: z.infer<typeof currentUserSchema> = {
    id: user.id,
    name: user.name,
    handle: user.handle,
  };

  res.json(dataToSend);
});

api.get("/users/:userId", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.params.userId,
    },
    select: {
      handle: true,
      name: true,
    },
  });
});

api.get("/chats", isLoggedIn, async (req, res) => {
  const chats = await prisma.chat.findMany({
    where: {
      members: {
        some: { id: { equals: req.currentUser.id } },
      },
    },
    select: {
      name: true,
      id: true,
      latest: true,
      description: true,
      inviteCode: true,
      createdAt: true,
      type: true,
      _count: true,
      isPublic: true,
      creatorId: true,
      creator: {
        select: {
          id: true,
          handle: true,
          name: true,
        },
      },
      members: {
        select: {
          id: true,
          handle: true,
          name: true,
        },
      },
    },
    orderBy: {
      latest: "desc",
    },
  });

  const chatsToSend = chats.map((chatData) => {
    return {
      name: chatData.name,
      id: chatData.id,
      latest: chatData.latest,
      description: chatData.description,
      inviteCode: chatData.inviteCode,
      createdAt: chatData.createdAt,
      type: chatData.type,
      _count: chatData._count,
      isPublic: chatData.isPublic,
      creatorId: chatData.creatorId,
      creator: chatData.creator,
      members: chatData.members,
    };
  });

  res.json(chatsToSend);
});

// NOTE: Rewrite this using cursor-based pagination (?)
api.get("/chats/:chatId/messages", async (req, res) => {
  // const page = req.query.page === undefined ? 0 : Number(req.query.page);
  // if (Number.isNaN(page)) return res.sendStatus(400);

  const messages = await prisma.message.findMany({
    where: {
      chatId: req.params.chatId,
    },
    select: {
      id: true,
      chatId: true,
      author: {
        select: {
          id: true,
          handle: true,
          name: true,
        },
      },
      content: true,
      createdAt: true,
    },
  });

  const dataToSend: z.infer<typeof messageSchema>[] = messages;
  res.json(dataToSend);
});

api.get("/requests", isLoggedIn, async (req, res) => {
  const inboundRequests = await prisma.request.findMany({
    where: {
      receiverId: {
        equals: req.currentUser.id,
      },
    },
    select: {
      id: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          name: true,
          handle: true,
        },
      },
    },
  });

  res.json(inboundRequests);
});

export default api;
