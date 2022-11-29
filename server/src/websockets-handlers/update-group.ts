import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  baseDataSchema,
  updateGroupSchema,
  updateImageSchema,
} from "../zod/schemas";
import path from "path";
import fs from "fs/promises";

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

  // Save base64 image to filesystem
  if (updatedGroupData.image) {
    const imgPath = path.join(
      __dirname,
      "..",
      "..",
      "avatars",
      `${updatedGroup.id}.jpeg`
    );
    console.log(imgPath);

    console.log("got here!!");
    const base64data = updatedGroupData.image.split(";base64,").pop();
    const buffer = Buffer.from(base64data as string, "base64");
    await fs.writeFile(imgPath, buffer);
  }

  // Send group data to group creator
  const dataToSend: z.infer<typeof baseDataSchema> = {
    ...updatedGroupData,
    dataType: "update-group",
  };

  // Format update group image data
  const updateImageDataToSend: z.infer<typeof updateImageSchema> = {
    dataType: "update-image",
    objectType: "group",
    id: updatedGroup.id,
  };

  if (updatedGroupData.image) {
    ws.send(JSON.stringify(updateImageDataToSend));
  }

  const onlineClients: WebSocket[] = [];
  updatedGroup.members.forEach((m) => {
    const client = userSocketMap.get(m.id);
    if (client) onlineClients.push(client);
  });

  onlineClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(dataToSend));
      if (updatedGroupData.image) {
        ws.send(JSON.stringify(updateImageDataToSend));
      }
    }
  });
}
