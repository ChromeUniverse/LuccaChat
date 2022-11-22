import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { messageSchemaType } from "../zod/api-messages";
import { addMessageSchema, baseDataSchema } from "../zod/schemas";

export async function handleAddMessage(
  wsUserMap: Map<WebSocket, string>,
  prisma: PrismaClient,
  jsonData: any
) {
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

  // update "latest" field for this chat
  const updatedchat = await prisma.chat.update({
    where: {
      id: addedMessage.chatId,
    },
    data: {
      latest: new Date(),
    },
  });

  console.log("Updated chat:", updatedchat.latest);

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
    dataType: "add-message",
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
