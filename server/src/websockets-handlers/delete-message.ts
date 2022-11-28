import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { deleteMessageSchema } from "../zod/schemas";

export async function handleDeleteMessage(
  ws: WebSocket,
  userSocketMap: Map<string, WebSocket>,
  prisma: PrismaClient,
  jsonData: any
) {
  const messageData = deleteMessageSchema.parse(jsonData);

  console.log("Got delete message data from client:", messageData);

  // fetch the chat to add this message to
  const chat = await prisma.chat.findUnique({
    where: { id: messageData.chatId },
    select: {
      id: true,
      members: { select: { id: true } },
    },
  });

  // check if this chat exists
  if (!chat) {
    throw new Error(
      `VIOLATION: User ID ${ws.userId} tried deleting message from non-existent chat`
    );
  }

  // check if this user belongs to this chat
  const memberIds = chat.members.map((m) => m.id);
  if (!memberIds.includes(ws.userId)) {
    throw new Error(
      `VIOLATION: Non-member ID ${ws.userId} tried deleting message from chat ${chat.id}`
    );
  }

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
  const onlineClients: WebSocket[] = [];
  deletedMessage.chat.members.forEach((m) => {
    const client = userSocketMap.get(m.id);
    if (client) onlineClients.push(client);
  });

  onlineClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(dataToSend));
    }
  });
}
