import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { regenInviteSchema, setInviteSchema } from "../zod/schemas";
import { nanoid } from "nanoid";

export async function handleRegenInvite(
  ws: WebSocket,
  wsUserMap: Map<WebSocket, string>,
  prisma: PrismaClient,
  jsonData: any
) {
  // Extract updated group data from WS message
  const userId = wsUserMap.get(ws);
  const { groupId } = regenInviteSchema.parse(jsonData);

  // Check if user who invoked this is the group's creator
  const groupToUpdate = await prisma.chat.findUnique({
    where: { id: groupId },
    select: { creatorId: true, type: true, inviteCode: true },
  });

  // sanity checks
  if (!groupToUpdate) {
    throw new Error(
      `VIOLATION: User ${userId} tried regen-ing invite for non-existent group`
    );
  }

  if (groupToUpdate.type === "DM" || !groupToUpdate.inviteCode) {
    throw new Error(
      `VIOLATION: User ${userId} tried updating non-existent invite on DM ${groupId}`
    );
  }

  if (groupToUpdate?.creatorId !== userId) {
    throw new Error(
      `VIOLATION: Non-creator user ${userId} tried updating Group ${groupId}`
    );
  }

  // Update group in DB
  const updatedGroup = await prisma.chat.update({
    where: { id: groupId },
    data: { inviteCode: nanoid() },
    select: {
      type: true,
      inviteCode: true,
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
  const inviteDataToSend: z.infer<typeof setInviteSchema> = {
    dataType: "set-invite",
    groupId: groupId,
    inviteCode: updatedGroup.inviteCode as string,
  };

  // Boardcast to all clients connected to this chat
  const clientUserIds = updatedGroup.members.map((m) => m.id);
  wsUserMap.forEach((userId, ws) => {
    if (!clientUserIds.includes(userId)) return;
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(inviteDataToSend));
    }
  });
}
