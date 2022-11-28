import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { currentUserSchema } from "../zod/schemas";
import { getCurrentUser, isLoggedIn } from "../middleware/login";

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
// [ ] /api/login                       -> idempotent Google Auth login/signup, returns JWT
// [ ] /api/user                        -> returns user information for current user
// [ ] /api/users/:userId               -> return inframtion for a specific user
// [ ] /api/requests                    -> returns unacknowledged requests
// [ ] /api/chats                       -> fetches a list of chats for a user
// [ ] /api/chats/:chatId               -> fetches basic info about a specific chat
// [ ] /api/chats/:chatId/messages      -> fetches all messages for a specific chat
// [ ] /api/chats/:chatId/members       -> fetches all members for a specific chat
//
// POST (?)
// [ ] /api/requests                    -> creates a new friend requests
// [ ] /api/chats                       -> creates a new chat (group or DM)
// [ ] /api/chats/:chatId/messages      -> creates a new message
//
// PUT
// [ ] /api/user/settings               -> updates user settings
// [ ] /api/chats/:chatId/settings      -> updates chat settings
//
// PATCH:
// [ ] /api/chats/:chatId/invite        -> regenerates invite code
//
// DELETE:
// [ ] /api/requests/:requestId         -> deletes this request (reject/accept)

// NOTE: Add auth middleware!!!

api.get("/user", isLoggedIn, async (req, res) => {
  const currentUser = getCurrentUser(req);

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
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
  const currentUser = getCurrentUser(req);
  const chats = await prisma.chat.findMany({
    where: {
      members: {
        some: { id: { equals: currentUser.id } },
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
  const page = req.query.page === undefined ? 0 : Number(req.query.page);
  if (Number.isNaN(page)) return res.sendStatus(400);

  // aee1ffa7-6947-4a5f-ba7c-a52609423dc3
  const batch = 10;
  const messages = await prisma.chat.findUnique({
    where: {
      id: req.params.chatId,
    },
    select: {
      messages: {
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
        orderBy: {
          createdAt: "asc",
        },
        take: batch,
        skip: batch * page,
      },
    },
  });

  res.json(messages?.messages);
});

api.get("/chats/:chatId/members", async (req, res) => {
  // aee1ffa7-6947-4a5f-ba7c-a52609423dc3
  const batch = 10;
  const members = await prisma.chat.findUnique({
    where: {
      id: req.params.chatId,
    },
    select: {
      members: {
        select: {
          id: true,
          handle: true,
          name: true,
        },
      },
      creator: {
        select: {
          id: true,
          handle: true,
          name: true,
        },
      },
    },
  });

  res.json(members);
});

api.get("/requests", isLoggedIn, async (req, res) => {
  const currentUser = getCurrentUser(req);
  const inboundRequests = await prisma.request.findMany({
    where: {
      receiverId: {
        equals: currentUser.id,
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
