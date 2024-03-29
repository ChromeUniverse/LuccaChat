import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  baseDataSchema,
  createGroupSchema,
  errorGroupInfoSchema,
} from "../zod/schemas";
import { nanoid } from "nanoid";
import { chatSchema } from "../zod/api-chats";
import path from "path";
import fs from "fs/promises";

export async function handleCreateGroup(
  ws: WebSocket,
  prisma: PrismaClient,
  jsonData: any
) {
  try {
    // check if user is auth'd
    if (!ws.userId) {
      ws.close();
      throw new Error("VIOLATION: Unauthenticated user tried creating group");
    }

    // Extract new group data from WS message
    const { name, description, isPublic, image } =
      createGroupSchema.parse(jsonData);

    let nameError = "";
    let descriptionError = "";

    // basic sanity checks
    if (name === "") nameError = "This can't be blank";
    if (description === "") descriptionError = "This can't be blank";

    // Char limit checks
    if (name.length > 20) {
      nameError = "Group name can't exceed 20 characters";
    }

    if (description.length > 150) {
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

    // Create new group in DB
    const createdGroup = await prisma.chat.create({
      data: {
        type: "GROUP",
        name: name,
        inviteCode: nanoid(),
        isPublic: isPublic,
        description: description,
        creator: {
          connect: { id: ws.userId },
        },
        members: {
          connect: [{ id: ws.userId }],
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
            accentColor: true,
          },
        },
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

    // Save base64 image to filesystem
    const imgPath = path.join(
      __dirname,
      "..",
      "..",
      "avatars",
      `${createdGroup.id}.jpeg`
    );
    console.log(imgPath);

    console.log("got here!!");
    const base64data = image.split(";base64,").pop();
    const buffer = Buffer.from(base64data as string, "base64");
    await fs.writeFile(imgPath, buffer);

    // Send group data to group creator
    const groupDataToSend: z.infer<typeof chatSchema> = createdGroup;
    const dataToSend: z.infer<typeof baseDataSchema> = {
      ...groupDataToSend,
      dataType: "create-group",
    };

    ws.send(JSON.stringify(dataToSend));
  } catch (error) {
    console.error(error);
  }
}
