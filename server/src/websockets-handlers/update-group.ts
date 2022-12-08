// ------------------------------------------------

import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  baseDataSchema,
  errorGroupInfoSchema,
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
  try {
    // check if user is auth'd
    if (!ws.userId) {
      ws.close();
      throw new Error(
        "VIOLATION: Unauthenticated user tried updating group settings"
      );
    }

    // Extract updated group data from WS message
    const data = updateGroupSchema.parse(jsonData);

    // First check if his group even exists in the first place
    const groupToUpdate = await prisma.chat.findUnique({
      where: { id: data.groupId },
      select: { creatorId: true },
    });

    if (!groupToUpdate) {
      throw new Error(
        `VIOLATION: User ${ws.userId} tried updating non-existent group ${data.groupId}`
      );
    }

    // Check if user who invoked this is the group's creator
    if (groupToUpdate.creatorId !== ws.userId) {
      throw new Error(
        `VIOLATION: User ${ws.userId} tried updating Group ${data.groupId}`
      );
    }

    let nameError = "";
    let descriptionError = "";

    // basic sanity checks
    if (data.name === "") nameError = "This can't be blank";
    if (data.description === "") descriptionError = "This can't be blank";

    // Char limit checks
    if (data.name.length > 20) {
      nameError = "Group name can't exceed 20 characters";
    }

    if (data.description.length > 150) {
      descriptionError = "Description can't exceed 150 characters";
    }

    // Check if there are any errors, send 'em down the wire
    if (nameError !== "" || descriptionError !== "") {
      console.log("Sending errors...");

      const dataToSend: z.infer<typeof errorGroupInfoSchema> = {
        dataType: "error-group-info",
        nameError: nameError,
        descriptionError: descriptionError,
      };
      return ws.send(JSON.stringify(dataToSend));
    }

    // Update group in DB
    const updatedGroup = await prisma.chat.update({
      where: {
        id: data.groupId,
      },
      data: {
        name: data.name,
        description: data.description,
        isPublic: data.isPublic,
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
    if (data.image) {
      const imgPath = path.join(
        __dirname,
        "..",
        "..",
        "avatars",
        `${updatedGroup.id}.jpeg`
      );
      console.log(imgPath);

      console.log("got here!!");
      const base64data = data.image.split(";base64,").pop();
      const buffer = Buffer.from(base64data as string, "base64");
      await fs.writeFile(imgPath, buffer);
    }

    // Send group data to group creator
    const dataToSend: z.infer<typeof baseDataSchema> = {
      ...data,
      dataType: "update-group",
    };

    // Format update group image data
    const updateImageDataToSend: z.infer<typeof updateImageSchema> = {
      dataType: "update-image",
      objectType: "group",
      id: updatedGroup.id,
    };

    if (data.image) {
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
        if (data.image) {
          ws.send(JSON.stringify(updateImageDataToSend));
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
}
