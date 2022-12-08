import express from "express";
import prisma from "../prisma";
import { z } from "zod";
import { isLoggedIn } from "../middleware/login";
import { messageSchema } from "../zod/api-messages";
import { chatSchema, chatsSchema } from "../zod/api-chats";
import { currentUserSchema, userSchema } from "../zod/user";
import { asyncJWTsign } from "../misc/jwt";
import { WsAuthJwtToSend } from "../../types/jwt";

// Express router config
const api = express.Router();
api.use(express.json());

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

  const payload: WsAuthJwtToSend = { id: user.id };

  const dataToSend: z.infer<typeof currentUserSchema> = {
    id: user.id,
    name: user.name,
    handle: user.handle,
    accentColor: user.accentColor,
    wsAuthToken: (await asyncJWTsign(
      payload,
      process.env.WS_JWT_SECRET as string
    )) as string,
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

  res.json(user);
});

api.get("/chats", isLoggedIn, async (req, res) => {
  const chats: z.infer<typeof chatsSchema> = await prisma.chat.findMany({
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
          accentColor: true,
        },
      },
      members: {
        select: {
          id: true,
          handle: true,
          name: true,
          accentColor: true,
        },
      },
    },
    orderBy: {
      latest: "desc",
    },
  });

  res.json(chats);
});

api.get("/chats/:chatId", isLoggedIn, async (req, res) => {
  const chat = await prisma.chat.findFirst({
    where: {
      id: req.params.chatId,
      members: {
        some: { id: { equals: req.currentUser.id } },
      },
    },
    include: {
      _count: true,
      creator: {
        select: {
          id: true,
          handle: true,
          name: true,
          accentColor: true,
        },
      },
      members: {
        select: {
          id: true,
          handle: true,
          name: true,
          accentColor: true,
        },
      },
    },
  });

  // Return a 404 if chat was not foundd
  if (!chat) return res.sendStatus(404);
  const chatToSend: z.infer<typeof chatSchema> = chat;

  res.json(chatToSend);
});

api.get("/invite/:inviteCode", async (req, res) => {
  // fetch chat by invite code
  const chat = await prisma.chat.findFirst({
    where: { inviteCode: req.params.inviteCode },
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
          accentColor: true,
        },
      },
      members: {
        select: {
          id: true,
          handle: true,
          name: true,
          accentColor: true,
        },
      },
    },
    orderBy: {
      latest: "desc",
    },
  });

  // No chat found? send a 404 error
  if (!chat) return res.sendStatus(404);
  const chatToSend: z.infer<typeof chatSchema> = chat;
  return res.json(chatToSend);
});

api.get("/common-groups/:otherUserId", isLoggedIn, async (req, res) => {
  // check if other user exists in the first place
  const otherUser = await prisma.user.findUnique({
    where: { id: req.params.otherUserId },
  });

  if (!otherUser) return res.sendStatus(404);

  const commonGroups: z.infer<typeof chatsSchema> = await prisma.chat.findMany({
    where: {
      type: "GROUP",
      AND: [
        { members: { some: { id: req.currentUser.id } } },
        { members: { some: { id: req.params.otherUserId } } },
      ],
    },
    include: {
      _count: true,
      creator: {
        select: {
          id: true,
          handle: true,
          name: true,
          accentColor: true,
        },
      },
      members: {
        select: {
          id: true,
          handle: true,
          name: true,
          accentColor: true,
        },
      },
    },
    orderBy: {
      latest: "desc",
    },
  });

  console.log(
    `Groups with both users ${req.currentUser.id} and ${req.params.otherUserId}`,
    commonGroups
  );

  res.json(commonGroups);
});

api.get("/public-groups", isLoggedIn, async (req, res) => {
  const publicGroups: z.infer<typeof chatsSchema> = await prisma.chat.findMany({
    where: {
      type: "GROUP",
      isPublic: true,
    },
    include: {
      _count: true,
      creator: {
        select: {
          id: true,
          handle: true,
          name: true,
          accentColor: true,
        },
      },
      members: {
        select: {
          id: true,
          handle: true,
          name: true,
          accentColor: true,
        },
      },
    },
    orderBy: {
      latest: "desc",
    },
  });

  res.json(publicGroups);
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
          accentColor: true,
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
          accentColor: true,
        },
      },
    },
  });

  res.json(inboundRequests);
});

export default api;
