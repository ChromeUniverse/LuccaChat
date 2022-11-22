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
  wsUserMap: Map<WebSocket, string>,
  prisma: PrismaClient,
  jsonData: any
) {
  // Extract updated group data from WS message
  const userId = wsUserMap.get(ws);
  const updatedUserData = updateUserSettingsSchema.parse(jsonData);
  const { name, handle, email } = updatedUserData;

  let nameError = "";
  let handleError = "";
  let emailError = "";

  // basic sanity checks
  if (name === "") nameError = "This can't be blank";
  if (handle === "") handleError = "This can't be blank";
  if (email === "") emailError = "This can't be blank";

  // Validate email
  const parsedEmail = z.string().email().safeParse(email);
  if (!parsedEmail.success) {
    console.log("email parsing failed");
    emailError = "Invalid email";
  }

  // Check if user is actually in DB (checking by ID)
  const userToUpdate = await prisma.user.findUnique({
    where: { id: userId },
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
  if (nameError !== "" || handleError !== "" || emailError !== "") {
    console.log("Sending errors...");

    const dataToSend: z.infer<typeof errorUserInfoSchema> = {
      dataType: "error-user-info",
      nameError: nameError,
      handleError: handleError,
      emailError: emailError,
    };
    return ws.send(JSON.stringify(dataToSend));
  }

  // Update user's info in DB, pull related chats
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: name,
      handle: handle,
      email: email,
    },
    select: {
      id: true,
      name: true,
      handle: true,
      email: true,
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
    email: email,
  };

  // Send it back to the user
  ws.send(JSON.stringify(dataToSend));

  // Building set of all clients connected to this user's chats:
  const clientUserIdSet = new Set<string>();
  const clientSet = new Set<WebSocket>();

  // first, get all users that share a DM/group with this user
  updatedUser.chats.forEach((chat) => {
    chat.members.forEach((member) => clientUserIdSet.add(member.id));
  });

  // then, loop over the Websocket/User map and find any matching clients
  wsUserMap.forEach((userId, ws) => {
    if (clientUserIdSet.has(userId)) clientSet.add(ws);
  });

  // Boardcast to all clients connected to this user's chats
  clientSet.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(dataToSend));
    }
  });
}
