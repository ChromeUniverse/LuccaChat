import { WebSocket, WebSocketServer } from "ws";
import { baseDataSchema } from "./zod/schemas";
import { PrismaClient } from "@prisma/client";

// Websocket message handlers
import { handleAddMessage } from "./websockets-handlers/add-message";
import { handleDeleteMessage } from "./websockets-handlers/delete-message";
import { handleSendRequest } from "./websockets-handlers/send-request";
import { handleRemoveRequest } from "./websockets-handlers/remove-request";
import { handleCreateGroup } from "./websockets-handlers/create-group";
import { handleDeleteGroup } from "./websockets-handlers/delete-group";
import { handleUpdateGroup } from "./websockets-handlers/update-group";
import { handleRegenInvite } from "./websockets-handlers/regen-invite";
import { json } from "stream/consumers";
import { handleUpdateUserSettings } from "./websockets-handlers/update-user-settings";
import { handleRemoveMember } from "./websockets-handlers/remove-member";
import { asyncJWTverify } from "./misc/jwt";
import { UserJwtReceived } from "../types/jwt";

// Prisma setup
const prisma = new PrismaClient();

// Websockets server setup
const wss = new WebSocketServer({ port: Number(process.env.WS_PORT) });

// const wsUserMap = new Map<WebSocket, string>();

//
// TODO: Reverse the Map!!!
//
const userSocketMap = new Map<string, WebSocket>();

wss.on("listening", () => {
  console.log(`WebSockets server started on port ${process.env.WS_PORT}`);
});

wss.on("connection", async function connection(ws, req) {
  // authenticate incoming websocket connection
  const cookies = req.headers.cookie;
  if (!cookies) return ws.close();
  let currentUser: UserJwtReceived = { id: "", iat: 0 };

  try {
    // Decode auth JWT
    const token = cookies.split("=")[1];
    currentUser = (await asyncJWTverify(
      token,
      process.env.JWT_SECRET as string
    )) as UserJwtReceived;
  } catch (err) {
    console.error(err);
    return ws.close();
  }

  // check for JWT expiry
  const expiryTime = Number(process.env.JWT_EXPIRY);
  if (Math.round(Date.now() / 1000) - currentUser.iat > expiryTime) {
    return ws.close();
  }

  // Bind user ID to WebSocket, add it to map
  ws.userId = currentUser.id;
  userSocketMap.set(currentUser.id, ws);

  console.log(`User ID ${ws.userId} connected`);

  ws.on("message", async function message(rawData) {
    try {
      const jsonData = JSON.parse(rawData.toString());
      const data = baseDataSchema.parse(jsonData);

      console.log("Got parsed data", jsonData);

      // Process chat messages
      if (data.dataType === "add-message") {
        handleAddMessage(ws, userSocketMap, prisma, jsonData);
      }

      if (data.dataType === "delete-message") {
        handleDeleteMessage(ws, userSocketMap, prisma, jsonData);
      }

      if (data.dataType === "send-request") {
        handleSendRequest(ws, userSocketMap, prisma, jsonData);
      }

      if (data.dataType === "remove-request") {
        handleRemoveRequest(ws, userSocketMap, prisma, jsonData);
      }

      if (data.dataType === "create-group") {
        handleCreateGroup(ws, prisma, jsonData);
      }

      if (data.dataType === "update-group") {
        handleUpdateGroup(ws, userSocketMap, prisma, jsonData);
      }

      if (data.dataType === "delete-group") {
        handleDeleteGroup(ws, userSocketMap, prisma, jsonData);
      }

      if (data.dataType === "regen-invite") {
        handleRegenInvite(ws, userSocketMap, prisma, jsonData);
      }

      if (data.dataType === "update-user-settings") {
        handleUpdateUserSettings(ws, userSocketMap, prisma, jsonData);
      }

      if (data.dataType === "remove-member") {
        handleRemoveMember(ws, userSocketMap, prisma, jsonData);
      }
    } catch (error) {
      console.error(error);
    }
  });

  ws.on("close", function () {
    if (!ws.userId) return;
    console.log(`User ID ${ws.userId} has disconnected`);
    userSocketMap.delete(ws.userId);
  });
});
