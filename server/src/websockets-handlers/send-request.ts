import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  ackRequestSchema,
  baseDataSchema,
  errorRequestSchema,
  sendRequestSchema,
} from "../zod/schemas";
import { requestSchema } from "../zod/api-requests";
import { getWSfromUserId } from "../misc";

export async function handleSendRequest(
  ws: WebSocket,
  wsUserMap: Map<WebSocket, string>,
  prisma: PrismaClient,
  jsonData: any
) {
  // for testing purposes only:
  const userId = "19c5cede-a9ae-4479-81c2-95dc9c0a0e37";

  const { handle } = sendRequestSchema.parse(jsonData);
  const targetUser = await prisma.user.findUnique({
    where: { handle: handle },
  });

  // targer user not found
  if (!targetUser) {
    console.log("target user not found");
    const dataToSend: z.infer<typeof errorRequestSchema> = {
      dataType: "error-request",
      error: "User not found",
    };
    return ws.send(JSON.stringify(dataToSend));
  }

  // Avoid user from sending friend requests to themselves
  if (targetUser.id === wsUserMap.get(ws)) {
    console.log("User trying to send friend self-request");
    const dataToSend: z.infer<typeof errorRequestSchema> = {
      dataType: "error-request",
      error: "You can't send a friend request to yourself",
    };
    return ws.send(JSON.stringify(dataToSend));
  }

  // Avoid user from sending friend request twice
  const foundRequest = await prisma.request.findFirst({
    where: {
      AND: [
        { receiver: { handle: { equals: handle } } },
        { sender: { id: { equals: wsUserMap.get(ws) } } },
      ],
    },
  });

  if (foundRequest) {
    console.log("Request already exists");

    const dataToSend: z.infer<typeof errorRequestSchema> = {
      dataType: "error-request",
      error: "You've already sent a friend request to this user",
    };
    return ws.send(JSON.stringify(dataToSend));
  }

  // Passed all sanity checks, create new friend request in DB
  const createdRequest = await prisma.request.create({
    data: {
      sender: { connect: { id: userId } },
      receiver: { connect: { id: targetUser.id } },
    },
    select: {
      id: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          handle: true,
          name: true,
        },
      },
      receiver: {
        select: {
          id: true,
          handle: true,
          name: true,
        },
      },
    },
  });

  // Format created request to send
  const requestToSend: z.infer<typeof requestSchema> = {
    id: createdRequest.id,
    createdAt: createdRequest.createdAt,
    sender: {
      id: createdRequest.sender.id,
      handle: createdRequest.sender.handle,
      name: createdRequest.sender.name,
    },
  };

  const dataToSend: z.infer<typeof baseDataSchema> = {
    ...requestToSend,
    dataType: "add-request",
  };

  // send newly created request to receiver
  const receiverClient = getWSfromUserId(wsUserMap, targetUser.id);
  if (receiverClient) receiverClient.send(JSON.stringify(dataToSend));

  // send ACK message to sender
  const ackDataToSend: z.infer<typeof ackRequestSchema> = {
    dataType: "ack-request",
  };
  ws.send(JSON.stringify(ackDataToSend));
}
