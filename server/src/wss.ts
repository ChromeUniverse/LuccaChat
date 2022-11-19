import { WebSocket, WebSocketServer } from "ws";
import { z } from "zod";
import {
  baseDataSchema,
  addMessageSchema,
  deleteMessageSchema,
  deleteMessageSchemaType,
} from "./zod/schemas";
import { PrismaClient } from "@prisma/client";
import { messageSchemaType } from "./zod/api-messages";

// Prisma setup
const prisma = new PrismaClient();

// Websockets server setup
const wss = new WebSocketServer({ port: 8081 });

const wsUserMap = new Map<WebSocket, string>();

wss.on("connection", function connection(ws) {
  const userId = "19c5cede-a9ae-4479-81c2-95dc9c0a0e37";
  wsUserMap.set(ws, userId);

  ws.on("message", async function message(rawData) {
    try {
      const jsonData = JSON.parse(rawData.toString());
      const data = baseDataSchema.parse(jsonData);

      console.log("Got parsed data", data);

      // Process chat messages
      if (data.type === "add-message") {
        const messageData = addMessageSchema.parse(jsonData);

        console.log("Got message data from client:", messageData);

        // add message to Database
        const addedMessage = await prisma.message.create({
          data: {
            content: messageData.content,
            author: {
              connect: { id: messageData.userId },
            },
            chat: {
              connect: { id: messageData.chatId },
            },
          },
          select: {
            id: true,
            chatId: true,
            author: true,
            content: true,
            createdAt: true,
            chat: {
              select: {
                id: true,
                members: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });

        console.log("added to DB:", addedMessage);

        const messageToSend: messageSchemaType = {
          content: addedMessage.content,
          id: addedMessage.id,
          chatId: addedMessage.chat.id,
          createdAt: addedMessage.createdAt,
          author: {
            id: addedMessage.author.id,
            handle: addedMessage.author.handle,
            name: addedMessage.author.name,
          },
        };

        const dataToSend: z.infer<typeof baseDataSchema> = {
          ...messageToSend,
          type: "add-message",
        };

        // Boardcast to all clients connected to this chat
        const clientUserIds = addedMessage.chat.members.map((m) => m.id);
        wsUserMap.forEach((userId, ws) => {
          if (!clientUserIds.includes(userId)) return;
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(dataToSend));
          }
        });
      }

      if (data.type === "delete-message") {
        const messageData = deleteMessageSchema.parse(jsonData);

        console.log("Got delete message data from client:", messageData);

        // delete message from Database
        const deletedMessage = await prisma.message.delete({
          where: {
            id: messageData.messageId,
          },
          select: {
            id: true,
            chatId: true,
            author: true,
            chat: {
              select: {
                id: true,
                members: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });

        console.log("deleted from DB:", deletedMessage);

        const dataToSend: deleteMessageSchemaType = {
          type: "delete-message",
          authorId: deletedMessage.author.id,
          messageId: deletedMessage.id,
          chatId: deletedMessage.chat.id,
        };

        // Boardcast to all clients connected to this chat
        const clientUserIds = deletedMessage.chat.members.map((m) => m.id);
        wsUserMap.forEach((userId, ws) => {
          if (!clientUserIds.includes(userId)) return;
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(dataToSend));
          }
        });
      }
    } catch (error) {}
  });

  ws.on("close", function () {
    wsUserMap.delete(ws);
  });

  // ws.send("something");
});
