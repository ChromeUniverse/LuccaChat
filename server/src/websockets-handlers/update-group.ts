import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { baseDataSchema, updateGroupSchema } from "../zod/schemas";

export async function handleUpdateGroup(
  ws: WebSocket,
  userSocketMap: Map<string, WebSocket>,
  prisma: PrismaClient,
  jsonData: any
) {
  // Extract updated group data from WS message
  const updatedGroupData = updateGroupSchema.parse(jsonData);

  // Check if user who invoked this is the group's creator
  const groupToUpdate = await prisma.chat.findUnique({
    where: { id: updatedGroupData.groupId },
    select: { creatorId: true },
  });

  if (groupToUpdate?.creatorId !== ws.userId) {
    throw new Error(
      `VIOLATION: User ${ws.userId} tried updating Group ${updatedGroupData.groupId}`
    );
  }

  // Update group in DB
  const updatedGroup = await prisma.chat.update({
    where: {
      id: updatedGroupData.groupId,
    },
    data: {
      name: updatedGroupData.name,
      description: updatedGroupData.description,
      isPublic: updatedGroupData.isPublic,
    },
    select: {
      name: true,
      id: true,
      description: true,
      isPublic: true,
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
    ...updatedGroupData,
    dataType: "update-group",
  };

  // Boardcast to all clients connected to this chat
  // const clientUserIds = updatedGroup.members.map((m) => m.id);
  // wsUserMap.forEach((userId, ws) => {
  //   if (!clientUserIds.includes(userId)) return;
  //   if (ws.readyState === WebSocket.OPEN) {
  //     ws.send(JSON.stringify(dataToSend));
  //   }
  // });

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
}
