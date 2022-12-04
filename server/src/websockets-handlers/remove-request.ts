import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { baseDataSchema, removeRequestSchema } from "../zod/schemas";
import { chatSchema } from "../zod/api-chats";

export async function handleRemoveRequest(
  ws: WebSocket,
  userSocketMap: Map<string, WebSocket>,
  prisma: PrismaClient,
  jsonData: any
) {
  try {
    // Find this request in database
    const { requestId, action } = removeRequestSchema.parse(jsonData);

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        sender: {
          select: {
            id: true,
            handle: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            handle: true,
            name: true,
          },
        },
      },
    });

    if (!request) throw new Error("`Request ID ${requestId} not found`");

    // delete request from DB
    await prisma.request.delete({ where: { id: request.id } });

    // Send command to receiver's client to remove request
    const dataToSend: z.infer<typeof removeRequestSchema> = {
      dataType: "remove-request",
      requestId: request.id,
      action: action,
    };

    ws.send(JSON.stringify(dataToSend));

    // early return if action was to reject request
    if (action === "reject") return console.log("GET DUNKED ON LMAO");

    const newDM = await prisma.chat.create({
      data: {
        type: "DM",
        members: {
          connect: [{ id: request.receiver.id }, { id: request.sender.id }],
        },
      },
      select: {
        id: true,
        createdAt: true,
        latest: true,
        _count: true,
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

    const dmToSend: z.infer<typeof chatSchema> = {
      type: "DM",
      name: null,
      id: newDM.id,
      latest: newDM.latest,
      description: null,
      inviteCode: null,
      createdAt: newDM.createdAt,
      isPublic: false,
      creatorId: null,
      creator: null,
      _count: newDM._count,
      members: newDM.members,
    };

    const dmDataToSend: z.infer<typeof baseDataSchema> = {
      ...dmToSend,
      dataType: "create-dm",
    };

    // send new DM data to all members
    // const clientUserIds = newDM.members.map((m) => m.id);
    // wsUserMap.forEach((userId, ws) => {
    //   if (!clientUserIds.includes(userId)) return;
    //   if (ws.readyState === WebSocket.OPEN) {
    //     ws.send(JSON.stringify(dmDataToSend));
    //   }
    // });

    // Boardcast to all clients connected to this chat
    const onlineClients: WebSocket[] = [];
    newDM.members.forEach((m) => {
      const client = userSocketMap.get(m.id);
      if (client) onlineClients.push(client);
    });

    onlineClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(dmDataToSend));
      }
    });
  } catch (error) {
    console.error(error);
  }
}

// ----------------------------------------
