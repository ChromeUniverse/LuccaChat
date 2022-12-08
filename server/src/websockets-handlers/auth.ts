import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { messageSchema, messageSchemaType } from "../zod/api-messages";
import {
  addMessageSchema,
  authAckSchema,
  authSchema,
  baseDataSchema,
} from "../zod/schemas";
import { UserJwtReceived, WsAuthJwtReceived } from "../../types/jwt";
import { asyncJWTverify } from "../misc/jwt";

export async function handleAuth(
  ws: WebSocket,
  userSocketMap: Map<string, WebSocket>,
  prisma: PrismaClient,
  jsonData: any
) {
  try {
    const { token } = authSchema.parse(jsonData);

    console.log("Got auth token from client:", token);

    const decoded = (await asyncJWTverify(
      token,
      process.env.WS_JWT_SECRET as string
    )) as WsAuthJwtReceived;

    // check for JWT expiry
    const expiryTime = Number(process.env.JWT_EXPIRY);
    if (Math.round(Date.now() / 1000) - decoded.iat > expiryTime) {
      return ws.close();
    }

    // Passed verification!
    console.log(`User ID ${decoded.id} connected`);

    // Bind user ID to WebSocket, add it to map
    ws.userId = decoded.id;
    userSocketMap.set(decoded.id, ws);

    // alert user
    const ackData: z.infer<typeof authAckSchema> = {
      dataType: "auth-ack",
      error: false,
    };

    ws.send(JSON.stringify(ackData));
  } catch (error) {
    // auth failed for some reason
    console.error(error);

    // alert user
    const ackData: z.infer<typeof authAckSchema> = {
      dataType: "auth-ack",
      error: true,
    };

    ws.send(JSON.stringify(ackData));

    return ws.close();
  }
}
