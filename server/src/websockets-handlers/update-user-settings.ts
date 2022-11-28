import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  errorUserInfoSchema,
  setUserInfoSchema,
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
  const { name, handle } = updatedUserData;

  let nameError = "";
  let handleError = "";

  // basic sanity checks
  if (name === "") nameError = "This can't be blank";
  if (handle === "") handleError = "This can't be blank";

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

  // Update user's info in DB, pull related chats
  const updatedUser = await prisma.user.update({
    where: {
      id: ws.userId,
    },
    data: {
      name: name,
      handle: handle,
    },
    select: {
      id: true,
      name: true,
      handle: true,
      chats: {
        select: {
          id: true,
          members: { select: { id: true } },
        },
      },
    },
  });

  // Format update user info data to send down the wire
  const dataToSend: z.infer<typeof setUserInfoSchema> = {
    dataType: "set-user-info",
    userId: updatedUser.id,
    name: updatedUser.name,
    handle: updatedUser.handle,
  };

  // Send it back to the user
  ws.send(JSON.stringify(dataToSend));

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
    }
  });
}
