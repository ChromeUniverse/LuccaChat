import { useEffect } from "react";
import { MessageType } from "../data";
import { useChatsStore } from "../zustand/chats-store";
import { z } from "zod";
import { emitter } from "../App";
import {
  baseDataSchema,
  addMessageSchema,
  deleteMessageSchema,
  deleteMessageSchemaType,
  sendRequestSchema,
  ackRequestSchema,
  errorRequestSchema,
  addRequestSchema,
  removeRequestSchema,
  removeMemberSchema,
  createGroupSchema,
  updateGroupSchema,
  deleteGroupSchema,
  regenInviteSchema,
  setInviteSchema,
  setUserInfoSchema,
  updateUserSettingsSchema,
  errorUserInfoSchema,
} from "../../../server/src/zod/schemas";
import { JsonSuperParse } from "../misc";
import { messageSchema } from "../../../server/src/zod/api-messages";
import { requestSchema } from "../../../server/src/zod/api-requests";
import { useRequestsStore } from "../zustand/requests-store";
import { chatSchema } from "../../../server/src/zod/api-chats";
import { useInfoStore } from "../zustand/info-panel-store";
import { useUserStore } from "../zustand/user-store";

let ws: WebSocket;
let consumers = 0;

function sendMessage(content: string) {
  const currentChatId = useChatsStore.getState().currentChatId;
  const user = useUserStore.getState().user;
  if (!currentChatId) {
    throw new Error("tried sending message, but chat ID is null, wtf?!");
  }

  const data: z.infer<typeof addMessageSchema> = {
    dataType: "add-message",
    userId: user.id,
    chatId: currentChatId,
    content: content,
  };

  ws.send(JSON.stringify(data));
  console.log("sent!");
}

function deleteMessage(chatId: string, messageId: string) {
  const user = useUserStore.getState().user;

  const data: deleteMessageSchemaType = {
    dataType: "delete-message",
    authorId: user.id,
    chatId: chatId,
    messageId: messageId,
  };

  ws.send(JSON.stringify(data));
  console.log("sent delete message!");
}

function sendRequest(handle: string) {
  const data: z.infer<typeof sendRequestSchema> = {
    dataType: "send-request",
    handle: handle,
  };

  console.log(JSON.stringify(data));

  ws.send(JSON.stringify(data));
  console.log("sent request");
}

function sendRemoveRequest(requestId: string, action: "reject" | "accept") {
  const data: z.infer<typeof removeRequestSchema> = {
    dataType: "remove-request",
    requestId: requestId,
    action: action,
  };

  console.log(JSON.stringify(data));

  ws.send(JSON.stringify(data));
  console.log("sent remove request");
}

function sendCreateGroup(name: string, description: string, isPublic: boolean) {
  const data: z.infer<typeof createGroupSchema> = {
    dataType: "create-group",
    name: name,
    description: description,
    isPublic: isPublic,
  };
  ws.send(JSON.stringify(data));
  console.log("sent create group");
}

function sendUpdateGroup(
  groupId: string,
  name: string,
  description: string,
  isPublic: boolean
) {
  const data: z.infer<typeof updateGroupSchema> = {
    dataType: "update-group",
    groupId: groupId,
    name: name,
    description: description,
    isPublic: isPublic,
  };
  ws.send(JSON.stringify(data));
  console.log("sent update group");
}

function sendDeleteGroup(groupId: string) {
  const data: z.infer<typeof deleteGroupSchema> = {
    dataType: "delete-group",
    groupId: groupId,
  };
  ws.send(JSON.stringify(data));
  console.log("sent delete group");
}

function sendRegenInvite(groupId: string) {
  const data: z.infer<typeof regenInviteSchema> = {
    dataType: "regen-invite",
    groupId: groupId,
  };
  ws.send(JSON.stringify(data));
  console.log("sent invite regen");
}

function sendUpdateUserSettings(name: string, handle: string, email: string) {
  const data: z.infer<typeof updateUserSettingsSchema> = {
    dataType: "update-user-settings",
    name: name,
    handle: handle,
    email: email,
  };
  ws.send(JSON.stringify(data));
  console.log("sent update user settings");
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
    ws.addEventListener("open", (event) => {
      console.log("Connected to WS server!");
    });

    // Listen for messages
    ws.addEventListener("message", (event) => {
      console.log("Message from server ", event.data);
      const jsonData = JsonSuperParse(event.data);
      const data = baseDataSchema.parse(jsonData);

      // Chat messages
      if (data.dataType === "add-message") {
        const messageData = messageSchema.parse(jsonData);
        emitter.emit("addChatMessage", messageData);

        const addMessage = useChatsStore.getState().addMessage;
        const updateLatest = useChatsStore.getState().updateLatest;
        addMessage(messageData.chatId, messageData);
        updateLatest(messageData.chatId, new Date());
      }

      if (data.dataType === "delete-message") {
        const messageData = deleteMessageSchema.parse(jsonData);
        const deleteMessage = useChatsStore.getState().deleteMessage;
        deleteMessage(messageData.chatId, messageData.messageId);
      }

      // Groups
      if (data.dataType === "create-group") {
        const newGroupData = chatSchema.parse(jsonData);
        const createNewGroup = useChatsStore.getState().createNewGroup;
        const setCurrentChatId = useChatsStore.getState().setCurrentChatId;
        emitter.emit("groupCreated");
        console.log("creating new Group...");
        createNewGroup(newGroupData);
        setCurrentChatId(newGroupData.id);
      }

      if (data.dataType === "update-group") {
        // Parse info
        const { groupId, name, description, isPublic } =
          updateGroupSchema.parse(jsonData);

        // Update zustand store + emit event
        const updateGroupSettings =
          useChatsStore.getState().updateGroupSettings;
        updateGroupSettings(groupId, name, description, isPublic);
        emitter.emit("groupUpdated", groupId);
      }

      if (data.dataType === "delete-group") {
        // Parse info
        const { groupId } = deleteGroupSchema.parse(jsonData);

        // If viewing deleted chat, head back to home screen
        const currentChatId = useChatsStore.getState().currentChatId;
        const closeChat = useChatsStore.getState().closeChat;
        const closeInfo = useInfoStore.getState().closeInfo;
        if (currentChatId === groupId) {
          closeInfo();
          closeChat();
        }

        // Update zustand store + emit event
        const removeGroup = useChatsStore.getState().removeGroup;
        removeGroup(groupId);
        emitter.emit("groupDeleted", groupId);
      }

      // Set invite code
      if (data.dataType === "set-invite") {
        const { groupId, inviteCode } = setInviteSchema.parse(jsonData);
        const setInviteCode = useChatsStore.getState().setInviteCode;
        setInviteCode(groupId, inviteCode);
        emitter.emit("inviteSet", groupId);
      }

      // DMs
      if (data.dataType === "create-dm") {
        const newDmData = chatSchema.parse(jsonData);
        const createNewDM = useChatsStore.getState().createNewDM;
        const setCurrentChatId = useChatsStore.getState().setCurrentChatId;
        console.log("creating new DM...");
        createNewDM(newDmData);
        setCurrentChatId(newDmData.id);
      }

      // Requests
      if (data.dataType === "ack-request") {
        emitter.emit("ackRequest");
      }

      if (data.dataType === "error-request") {
        const data = errorRequestSchema.parse(jsonData);
        emitter.emit("errorRequest", data.error);
      }

      if (data.dataType === "add-request") {
        const requestData = requestSchema.parse(jsonData);
        const addRequest = useRequestsStore.getState().addRequest;
        addRequest(requestData);
      }

      if (data.dataType === "remove-request") {
        const { requestId, action } = removeRequestSchema.parse(jsonData);
        const removeRequest = useRequestsStore.getState().removeRequest;
        removeRequest(requestId);
      }

      if (data.dataType === "set-user-info") {
        const { userId, name, handle, email } =
          setUserInfoSchema.parse(jsonData);

        const updateInfo = useUserStore.getState().updateInfo;
        updateInfo(name, handle, email);

        const updateUserInfoInChats =
          useChatsStore.getState().updateUserInfoInChats;
        updateUserInfoInChats(userId, name, handle);

        emitter.emit("userUpdated", userId);
      }

      if (data.dataType === "error-user-info") {
        const errorData = errorUserInfoSchema.parse(jsonData);
        emitter.emit("userUpdateError", errorData);
      }
    });
    return () => {
      consumers -= 1;
      console.log("Total consumers: ", consumers);
      if (consumers === 0) ws.close();
      console.log("Closed");
    };
  }, []);

  return {
    sendMessage,
    deleteMessage,
    sendRequest,
    sendRemoveRequest,
    sendCreateGroup,
    sendUpdateGroup,
    sendDeleteGroup,
    sendRegenInvite,
    sendUpdateUserSettings,
  };
}
