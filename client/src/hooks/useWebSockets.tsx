import { useEffect } from "react";
import { MessageType } from "../data";
import { useChatsStore, user } from "../zustand/chats-store";
import { z } from "zod";
import { emitter } from "../App";
import {
  baseDataSchema,
  addMessageSchema,
  deleteMessageSchema,
  deleteMessageSchemaType,
} from "../../../server/src/zod/schemas";
import { JsonSuperParse } from "../misc";
import { messageSchema } from "../../../server/src/zod/api-messages";

let ws: WebSocket;
let consumers = 0;

function sendMessage(content: string) {
  const currentChatId = useChatsStore.getState().currentChatId;

  const data = {
    type: "add-message",
    userId: user.id,
    chatId: currentChatId,
    content: content,
  };

  ws.send(JSON.stringify(data));
  console.log("sent!");
}

function deleteMessage(chatId: string, messageId: string) {
  const currentChatId = useChatsStore.getState().currentChatId;

  const data: deleteMessageSchemaType = {
    type: "delete-message",
    authorId: user.id,
    chatId: chatId,
    messageId: messageId,
  };

  ws.send(JSON.stringify(data));
  console.log("sent delete message!");
}

export default function useWebSockets() {
  useEffect(() => {
    consumers += 1;
    console.log("Total consumers: ", consumers);

    if (ws !== undefined && ws.readyState !== 3) {
      return console.log("Socket already created...");
    }

    console.log("Creating WS");

    if (consumers === 1) ws = new WebSocket("ws://localhost:8081");

    // Connection opened
    // ws.addEventListener("open", (event) => {
    //   ws.send("Hello Server!");
    // });

    // Listen for messages
    ws.addEventListener("message", (event) => {
      console.log("Message from server ", event.data);
      const jsonData = JsonSuperParse(event.data);
      const data = baseDataSchema.parse(jsonData);

      // Process chat messages
      if (data.type === "add-message") {
        const messageData = messageSchema.parse(jsonData);
        emitter.emit("addChatMessage", messageData);

        const addMessage = useChatsStore.getState().addMessage;
        addMessage(messageData.chatId, messageData);
      }

      if (data.type === "delete-message") {
        const messageData = deleteMessageSchema.parse(jsonData);
        const deleteMessage = useChatsStore.getState().deleteMessage;
        deleteMessage(messageData.chatId, messageData.messageId);
      }
    });
    return () => {
      consumers -= 1;
      console.log("Total consumers: ", consumers);
      if (consumers === 0) ws.close();
      console.log("Closed");
    };
  }, []);

  return { sendMessage, deleteMessage };
}
