import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { deleteGroupSchema, removeMemberSchema } from "../zod/schemas";

export async function handleRemoveMember(
  ws: WebSocket,
  userSocketMap: Map<string, WebSocket>,
  prisma: PrismaClient,
  jsonData: any
) {
  try {
    // Extract updated group data from WS message
    const removedMemberData = removeMemberSchema.parse(jsonData);

    // fetch group from Database
    const groupToUpdate = await prisma.chat.findUnique({
      where: { id: removedMemberData.groupId },
      include: {
        members: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!groupToUpdate) {
      throw new Error(
        `VIOLATION: User ID ${ws.userId} tried removing user from non-existent group`
      );
    }

    // Check if this chat is a group or not
    if (groupToUpdate.type !== "GROUP") {
      throw new Error(
        `VIOLATION: User ID ${ws.userId} tried removing someone from DM ID ${groupToUpdate.id}`
      );
    }

    // Check if user to delete is actually in this group
    const memberIds = groupToUpdate.members.map((m) => m.id);
    if (!memberIds.includes(removedMemberData.memberId)) {
      throw new Error(
        `VIOLATION: User ID ${ws.userId} tried removing non-existent user from Group ID ${groupToUpdate.id}`
      );
    }

    // Check if this user isn't the group's creator
    // AND is trying to delete someone other than themselves
    if (
      groupToUpdate.creatorId !== ws.userId &&
      removedMemberData.memberId !== ws.userId
    ) {
      throw new Error(
        `VIOLATION: Non-creator user ID ${ws.userId} tried removing user from Group ID ${groupToUpdate.id}`
      );
    }

    // Check if this user if trying to remove the group's creator
    if (groupToUpdate.creatorId === removedMemberData.memberId) {
      throw new Error(
        `VIOLATION: ser ID ${ws.userId} tried kicking Group ID ${groupToUpdate.id}'s creator`
      );
    }

    // disconnect this user from group chat
    const updatedGroup = await prisma.chat.update({
      where: { id: removedMemberData.groupId },
      data: {
        members: { disconnect: { id: removedMemberData.memberId } },
      },
      include: { members: { select: { id: true } } },
    });

    // Boardcast to all clients connected to this chat
    // const clientUserIds = groupToUpdate.members.map((m) => m.id);
    // wsUserMap.forEach((clientUserId, ws) => {
    //   if (!clientUserIds.includes(clientUserId)) return;
    //   if (ws.readyState === WebSocket.OPEN) {
    //     // Send "remove group" message to target member
    //     if (clientUserId === removedMemberData.memberId) {
    //       const dataToSend: z.infer<typeof deleteGroupSchema> = {
    //         dataType: "delete-group",
    //         groupId: updatedGroup.id,
    //       };
    //       ws.send(JSON.stringify(dataToSend));
    //     }
    //     // Send "remove Member" message to other members
    //     else {
    //       const dataToSend: z.infer<typeof removeMemberSchema> = {
    //         dataType: "remove-member",
    //         groupId: updatedGroup.id,
    //         memberId: removedMemberData.memberId,
    //       };
    //       ws.send(JSON.stringify(dataToSend));
    //     }
    //   }
    // });

    // Boardcast to all clients connected to this chat
    const onlineClients: WebSocket[] = [];
    groupToUpdate.members.forEach((m) => {
      const client = userSocketMap.get(m.id);
      if (client) onlineClients.push(client);
    });

    onlineClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        // Send "remove group" message to target member
        if (ws.userId === removedMemberData.memberId) {
          const dataToSend: z.infer<typeof deleteGroupSchema> = {
            dataType: "delete-group",
            groupId: updatedGroup.id,
          };
          ws.send(JSON.stringify(dataToSend));
        }
        // Send "remove Member" message to other members
        else {
          const dataToSend: z.infer<typeof removeMemberSchema> = {
            dataType: "remove-member",
            groupId: updatedGroup.id,
            memberId: removedMemberData.memberId,
          };
          ws.send(JSON.stringify(dataToSend));
        }
      }
    });
    console.log("Got to end of Remove Member WS handler");
  } catch (error) {
    console.error(error);
  }
}
