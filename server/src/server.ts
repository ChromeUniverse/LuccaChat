// Packages
import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { z } from "zod";
import { currentUserSchema } from "./zod/schemas";

// API router config
const api = express.Router();
api.use(express.json());
const port = 8080;

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
api.get("/user", async (req, res) => {
  const userId = "19c5cede-a9ae-4479-81c2-95dc9c0a0e37";
  // const userId = "320b6aba-8860-40d4-98b7-db0713bba8ea";
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return res.sendStatus(404);

  const dataToSend: z.infer<typeof currentUserSchema> = {
    id: user.id,
    name: user.name,
    handle: user.handle,
    email: user.email,
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

api.get("/chats", async (req, res) => {
  const userId = "19c5cede-a9ae-4479-81c2-95dc9c0a0e37";

  const chats = await prisma.chat.findMany({
    where: {
      members: {
        some: { id: { equals: userId } },
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

api.get("/requests", async (req, res) => {
  const userId = "19c5cede-a9ae-4479-81c2-95dc9c0a0e37";
  const inbound = await prisma.request.findMany({
    where: {
      receiverId: {
        equals: userId,
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

  res.json(inbound);
});

// Set up main server and API router, start server
const app = express();
app.use(cors({ origin: ["http://localhost:5173"] }));
app.use("/api", api);
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
