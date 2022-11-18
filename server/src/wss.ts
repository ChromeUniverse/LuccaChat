import { WebSocket, WebSocketServer } from "ws";
import { z } from "zod";

const wss = new WebSocketServer({ port: 8081 });

wss.on("connection", function connection(ws) {
  ws.on("message", function message(rawData) {
    try {
      const jsonData = JSON.parse(rawData.toString());

      // Base message validation
      const baseDataSchema = z.object({
        type: z.enum(["chat-message"]),
      });
      const data = baseDataSchema.parse(jsonData);

      console.log("Got parsed data", data);

      // Process chat messages
      if (data.type === "chat-message") {
        // Zod validation
        const messageDataSchema = baseDataSchema.extend({
          chatId: z.string(),
          username: z.string(),
          content: z.string(),
        });
        const messageData = messageDataSchema.parse(jsonData);

        console.log("Got message data from client:", messageData);

        // Boardcast to all connected clients
        wss.clients.forEach((client) => {
          console.log("Broadcasting to all clients...");
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(messageData));
          }
        });
      }
    } catch (error) {}
  });

  // ws.send("something");
});
