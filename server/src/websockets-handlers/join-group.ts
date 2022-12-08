import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  addMemberSchema,
  baseDataSchema,
  joinGroupAckSchema,
  joinGroupSchema,
  updateGroupSchema,
  updateImageSchema,
} from "../zod/schemas";
import path from "path";
import fs from "fs/promises";

export async function handleJoinGroup(
  ws: WebSocket,
  userSocketMap: Map<string, WebSocket>,
  prisma: PrismaClient,
  jsonData: any
) {
  try {
    // check if user is auth'd
    if (!ws.userId) {
      ws.close();
      throw new Error("VIOLATION: Unauthenticated user tried joining group");
    }

    // Extract data from WS message
    const { groupId } = joinGroupSchema.parse(jsonData);
    const groupToUpdate = await prisma.chat.findUnique({
      where: { id: groupId },
      include: { members: { select: { id: true } } },
    });

    // Fetch this user from the DB
    const currentUser = await prisma.user.findUnique({
      where: { id: ws.userId },
    });

    // Check if this user even exists in the first place
    if (!currentUser) {
      throw new Error(
        `VIOLATION: Non-existent user ${ws.userId} tried joining group ${groupId}`
      );
    }

    // Check if this group even exists
    if (!groupToUpdate) {
      throw new Error(
        `VIOLATION: User ${ws.userId} tried joining non-existent Group ${groupId}`
      );
    }

    // Check if this user is already in this group
    const originalMemberIds = groupToUpdate.members.map((m) => m.id);
    if (originalMemberIds.includes(ws.userId)) {
      const dataToSend: z.infer<typeof joinGroupAckSchema> = {
        groupId: groupId,
        dataType: "join-group-ack",
        error: true,
        msg: "You are already a member of this group!",
      };

      return ws.send(JSON.stringify(dataToSend));
    }

    // Update group in DB:
    // add this user to the list of member
    const updatedGroup = await prisma.chat.update({
      where: { id: groupId },
      data: {
        members: { connect: { id: ws.userId } },
      },
      include: {
        _count: true,
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
    });

    // Notify this chat's original members that a new member has joined
    const onlineClients: WebSocket[] = [];
    originalMemberIds.forEach((memberId) => {
      const client = userSocketMap.get(memberId);
      if (client) onlineClients.push(client);
    });

    const addMemberDataToSend: z.infer<typeof addMemberSchema> = {
      dataType: "add-member",
      groupId: groupId,
      memberId: currentUser.id,
      name: currentUser.name,
      handle: currentUser.handle,
    };

    onlineClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(addMemberDataToSend));
      }
    });

    // Format ack payload data, send it back to the user
    const ackDataToSend: z.infer<typeof joinGroupAckSchema> = {
      dataType: "join-group-ack",
      groupId: updatedGroup.id,
      error: false,
      msg: null,
    };

    ws.send(JSON.stringify(ackDataToSend));
  } catch (error) {
    console.error(error);
  }
}
