import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { baseDataSchema, deleteGroupSchema } from "../zod/schemas";
import { chatSchema, ChatSchemaType } from "../zod/api-chats";

export async function handleDeleteGroup(
  ws: WebSocket,
  userSocketMap: Map<string, WebSocket>,
  prisma: PrismaClient,
  jsonData: any
) {
  try {
    // Extract data from WS message
    const deleteGroupData = deleteGroupSchema.parse(jsonData);

    // Check if user who invoked this is the group's creator
    const groupToDelete = await prisma.chat.findUnique({
      where: { id: deleteGroupData.groupId },
      select: { creatorId: true },
    });

    if (groupToDelete?.creatorId !== ws.userId) {
      throw new Error(
        `VIOLATION: User ${ws.userId} tried deleting Group ${deleteGroupData.groupId}`
      );
    }

    // Create new group in DB
    const updatedGroup = await prisma.chat.delete({
      where: {
        id: deleteGroupData.groupId,
      },
      select: {
        members: {
          select: {
            id: true,
            handle: true,
            name: true,
          },
        },
      },
    });

    // Send group data to group creator
    const dataToSend: z.infer<typeof baseDataSchema> = {
      ...deleteGroupData,
      dataType: "delete-group",
    };

    // Boardcast to all clients connected to this chat
    const onlineClients: WebSocket[] = [];
    updatedGroup.members.forEach((m) => {
      const client = userSocketMap.get(m.id);
      if (client) onlineClients.push(client);
    });

    onlineClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(dataToSend));
      }
    });
  } catch (error) {
    console.error(error);
  }
}
