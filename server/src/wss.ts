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

// Prisma setup
const prisma = new PrismaClient();

// Websockets server setup
const wss = new WebSocketServer({ port: 8081 });

const wsUserMap = new Map<WebSocket, string>();

wss.on("connection", function connection(ws) {
  // for testing purposes only:
  const userId = "19c5cede-a9ae-4479-81c2-95dc9c0a0e37";
  wsUserMap.set(ws, userId);

  console.log(`User ID ${userId} connected`);

  ws.on("message", async function message(rawData) {
    try {
      const jsonData = JSON.parse(rawData.toString());
      const data = baseDataSchema.parse(jsonData);

      console.log("Got parsed data", jsonData);

      // Process chat messages
      if (data.dataType === "add-message") {
        handleAddMessage(wsUserMap, prisma, jsonData);
      }

      if (data.dataType === "delete-message") {
        handleDeleteMessage(wsUserMap, prisma, jsonData);
      }

      if (data.dataType === "send-request") {
        handleSendRequest(ws, wsUserMap, prisma, jsonData);
      }

      if (data.dataType === "remove-request") {
        handleRemoveRequest(ws, wsUserMap, prisma, jsonData);
      }

      if (data.dataType === "create-group") {
        handleCreateGroup(ws, wsUserMap, prisma, jsonData);
      }

      if (data.dataType === "update-group") {
        handleUpdateGroup(ws, wsUserMap, prisma, jsonData);
      }

      if (data.dataType === "delete-group") {
        handleDeleteGroup(ws, wsUserMap, prisma, jsonData);
      }

      if (data.dataType === "regen-invite") {
        handleRegenInvite(ws, wsUserMap, prisma, jsonData);
      }

      if (data.dataType === "update-user-settings") {
        handleUpdateUserSettings(ws, wsUserMap, prisma, jsonData);
      }
    } catch (error) {
      console.error(error);
    }
  });

  ws.on("close", function () {
    const userId = wsUserMap.get(ws);
    console.log(`User ID ${userId} has disconnected`);
    wsUserMap.delete(ws);
  });
});
