import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { deleteMessageSchema } from "../zod/schemas";

export async function handleDeleteMessage(
  wsUserMap: Map<WebSocket, string>,
  prisma: PrismaClient,
  jsonData: any
) {
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

  const dataToSend: z.infer<typeof deleteMessageSchema> = {
    dataType: "delete-message",
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
