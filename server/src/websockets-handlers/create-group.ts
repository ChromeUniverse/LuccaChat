import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { baseDataSchema, createGroupSchema } from "../zod/schemas";
import { nanoid } from "nanoid";
import { chatSchema } from "../zod/api-chats";
import path from "path";
import fs from "fs/promises";

export async function handleCreateGroup(
  ws: WebSocket,
  prisma: PrismaClient,
  jsonData: any
) {
  // Extract new group data from WS message
  const { name, description, isPublic, image } =
    createGroupSchema.parse(jsonData);

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
}
