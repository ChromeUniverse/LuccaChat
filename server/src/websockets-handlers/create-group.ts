import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { baseDataSchema, createGroupSchema } from "../zod/schemas";
import { nanoid } from "nanoid";
import { chatSchema, ChatSchemaType } from "../zod/api-chats";

export async function handleCreateGroup(
  ws: WebSocket,
  wsUserMap: Map<WebSocket, string>,
  prisma: PrismaClient,
  jsonData: any
) {
  // Extract new group data from WS message
  const creatorId = wsUserMap.get(ws);
  const { name, description, isPublic } = createGroupSchema.parse(jsonData);

  // Create new group in DB
  const createdGroup = await prisma.chat.create({
    data: {
      type: "GROUP",
      name: name,
      inviteCode: nanoid(),
      isPublic: isPublic,
      description: description,
      creator: {
        connect: { id: creatorId },
      },
      members: {
        connect: [{ id: creatorId }],
      },
    },
    select: {
      name: true,
      id: true,
      latest: true,
      description: true,
      inviteCode: true,
      createdAt: true,
      type: true,
      _count: true,
      isPublic: true,
      creatorId: true,
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

  // Send group data to group creator
  const groupDataToSend: z.infer<typeof chatSchema> = createdGroup;
  const dataToSend: z.infer<typeof baseDataSchema> = {
    ...groupDataToSend,
    dataType: "create-group",
  };

  ws.send(JSON.stringify(dataToSend));
}
