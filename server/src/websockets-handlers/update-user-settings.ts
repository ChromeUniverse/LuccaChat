import { WebSocket } from "ws";
import path from "path";
import fs from "fs/promises";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  errorUserInfoSchema,
  setUserInfoSchema,
  updateImageSchema,
  updateUserSettingsSchema,
} from "../zod/schemas";
import { getWSfromUserId } from "../misc";

export async function handleUpdateUserSettings(
  ws: WebSocket,
  userSocketMap: Map<string, WebSocket>,
  prisma: PrismaClient,
  jsonData: any
) {
  // Extract updated group data from WS message
  const updatedUserData = updateUserSettingsSchema.parse(jsonData);
  const { name, handle, accentColor } = updatedUserData;

  let nameError = "";
  let handleError = "";

  // basic sanity checks
  if (name === "") nameError = "This can't be blank";
  if (handle === "") handleError = "This can't be blank";

  // Char limit checks
  if (name.length > 20) nameError = "Please limit your name to 20 characters";
  if (handle.length > 15) {
    handleError = "Please limit your handle to 15 characters";
  }

  // Check handle for whitespaces
  const handleChars = handle.split("");
  if (handleChars.includes(" ")) {
    handleError = "Handles can't have whitespaces";
  }

  // Check if user is actually in DB (checking by ID)
  const userToUpdate = await prisma.user.findUnique({
    where: { id: ws.userId },
  });

  if (!userToUpdate) throw new Error("VIOLATION: User to update, not found");

  // Check if this handle is taken
  const userWithProvidedHandle = await prisma.user.findUnique({
    where: { handle: handle },
  });

  if (userWithProvidedHandle && userToUpdate.handle !== handle) {
    handleError = "This handle is already taken. Please try again";
  }

  // Check if there are any errors, send 'em down the wire
  if (nameError !== "" || handleError !== "") {
    console.log("Sending errors...");

    const dataToSend: z.infer<typeof errorUserInfoSchema> = {
      dataType: "error-user-info",
      nameError: nameError,
      handleError: handleError,
    };
    return ws.send(JSON.stringify(dataToSend));
  }

  // Save base64 image to filesystem
  if (updatedUserData.image) {
    const imgPath = path.join(
      __dirname,
      "..",
      "..",
      "avatars",
      `${ws.userId}.jpeg`
    );
    console.log(imgPath);

    console.log("got here!!");
    const base64data = updatedUserData.image.split(";base64,").pop();
    const buffer = Buffer.from(base64data as string, "base64");
    await fs.writeFile(imgPath, buffer);
  }

  // Update user's info in DB, pull related chats
  const updatedUser = await prisma.user.update({
    where: {
      id: ws.userId,
    },
    data: {
      name: name,
      handle: handle,
      accentColor: accentColor,
    },
    select: {
      id: true,
      name: true,
      handle: true,
      accentColor: true,
      chats: {
        select: {
          id: true,
          members: { select: { id: true } },
        },
      },
    },
  });

  // Format update user data, send it down the wire, back to the user
  const dataToSend: z.infer<typeof setUserInfoSchema> = {
    dataType: "set-user-info",
    userId: updatedUser.id,
    name: updatedUser.name,
    handle: updatedUser.handle,
    accentColor: updatedUser.accentColor,
  };

  ws.send(JSON.stringify(dataToSend));

  // Format update group image data
  const updateImageDataToSend: z.infer<typeof updateImageSchema> = {
    dataType: "update-image",
    objectType: "user",
    id: ws.userId,
  };

  if (updatedUserData.image) {
    ws.send(JSON.stringify(updateImageDataToSend));
  }

  // Building set of all clients connected to this user's chats:
  const clientUserIdSet = new Set<string>();
  const onlineClients: WebSocket[] = [];

  // first, get all users that share a DM/group with this user
  updatedUser.chats.forEach((chat) => {
    chat.members.forEach((member) => clientUserIdSet.add(member.id));
  });

  // then, loop over the client/userID set,
  // fetch the websocket and put it in the list of online clients
  clientUserIdSet.forEach((userId) => {
    const client = userSocketMap.get(userId);
    if (client) onlineClients.push(client);
  });

  // Boardcast to all clients connected to this user's chats
  onlineClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(dataToSend));
      if (updatedUserData.image) {
        ws.send(JSON.stringify(updateImageDataToSend));
      }
    }
  });
}
