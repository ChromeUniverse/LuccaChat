import { useEffect } from "react";
import { MessageType } from "../data";
import { useChatsStore, user } from "../zustand/chats-store";
import { z } from "zod";
import { emitter } from "../App";

let ws: WebSocket;
let consumers = 0;

function sendMessage(content: string) {
  const currentChatId = useChatsStore.getState().currentChatId;

  const data = {
    type: "chat-message",
    chatId: currentChatId,
    username: user.name,
    content: content,
  };

  ws.send(JSON.stringify(data));
  console.log("sent!");
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

      const jsonData = JSON.parse(event.data);

      // Base message validation
      const baseDataSchema = z.object({
        type: z.enum(["chat-message"]),
      });
      const data = baseDataSchema.parse(jsonData);

      // Process chat messages
      if (data.type === "chat-message") {
        // Zod validation
        const messageDataSchema = baseDataSchema.extend({
          chatId: z.string(),
          username: z.string(),
          content: z.string(),
        });

        type messageDataSchemaType = z.infer<typeof messageDataSchema>;

        const messageData = messageDataSchema.parse(jsonData);
        emitter.emit("chatMessage", messageData);

        const addMessage = useChatsStore.getState().addMessage;
        addMessage(messageData.chatId, messageData.content);
      }
    });
    return () => {
      consumers -= 1;
      console.log("Total consumers: ", consumers);
      if (consumers === 0) ws.close();
      console.log("Closed");
    };
  }, []);

  return sendMessage;
}
