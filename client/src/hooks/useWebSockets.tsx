import { useEffect } from "react";
import { colorType, MessageType } from "../data";
import { useChatsStore } from "../zustand/chats-store";
import { z } from "zod";
import { emitter } from "../routes/App";
import {
  baseDataSchema,
  addMessageSchema,
  deleteMessageSchema,
  deleteMessageSchemaType,
  sendRequestSchema,
  errorRequestSchema,
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
  updateImageSchema,
  joinGroupSchema,
  joinGroupAckSchema,
  errorGroupInfoSchema,
  authSchema,
  authAckSchema,
} from "../../../server/src/zod/schemas";
import { JsonSuperParse } from "../misc";
import { messageSchema } from "../../../server/src/zod/api-messages";
import { requestSchema } from "../../../server/src/zod/api-requests";
import { useRequestsStore } from "../zustand/requests-store";
import { chatSchema } from "../../../server/src/zod/api-chats";
import { useInfoStore } from "../zustand/info-panel-store";
import { useUserStore } from "../zustand/user-store";
import { inviteEmitter } from "../routes/Invite";
import fetchChats from "../api/fetchChats";
import fetchMessages from "../api/fetchMessages";
import fetchChatById from "../api/fetchChatById";
import { usePreferenceStore } from "../zustand/userPreferences";

let ws: WebSocket;
let consumers = 0;
let authToken: string = "";

function sendAuthRequest() {
  const authRequest: z.infer<typeof authSchema> = {
    dataType: "auth",
    token: authToken,
  };
  ws.send(JSON.stringify(authRequest));
}

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

function sendCreateGroup(
  name: string,
  description: string,
  isPublic: boolean,
  image: string
) {
  const data: z.infer<typeof createGroupSchema> = {
    dataType: "create-group",
    name: name,
    description: description,
    isPublic: isPublic,
    image: image,
  };
  ws.send(JSON.stringify(data));
  console.log("sent create group");
}

function sendUpdateGroup(
  groupId: string,
  name: string,
  description: string,
  isPublic: boolean,
  image: string
) {
  const data: z.infer<typeof updateGroupSchema> = {
    dataType: "update-group",
    groupId: groupId,
    name: name,
    description: description,
    isPublic: isPublic,
    image: image === "" ? null : image,
  };

  console.log(data);

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

function sendUpdateUserSettings(
  name: string,
  handle: string,
  image: string,
  accentColor: colorType
) {
  const data: z.infer<typeof updateUserSettingsSchema> = {
    dataType: "update-user-settings",
    name: name,
    handle: handle,
    image: image,
    accentColor: accentColor,
  };
  ws.send(JSON.stringify(data));
  console.log("sent update user settings");
}

function sendKickMember(groupId: string, memberId: string) {
  const data: z.infer<typeof removeMemberSchema> = {
    dataType: "remove-member",
    groupId: groupId,
    memberId: memberId,
  };
  ws.send(JSON.stringify(data));
  console.log("sent kick member");
}

function sendJoinGroup(groupId: string) {
  const data: z.infer<typeof joinGroupSchema> = {
    dataType: "join-group",
    groupId: groupId,
  };
  ws.send(JSON.stringify(data));
  console.log("sent join group");
}

export default function useWebSockets() {
  useEffect(() => {
    consumers += 1;
    console.log("Total consumers: ", consumers);

    if (ws !== undefined && ws.readyState === ws.OPEN) {
      console.log(ws.readyState);
      return console.log("Socket already created...");
    }

    console.log("Creating WS");

    if (consumers === 1) {
      ws = new WebSocket(import.meta.env.VITE_WEBSOCKETS_URL);
    }

    // Connection opened
    ws.addEventListener("open", (event) => {
      console.log("Connected to WS server!");

      if (authToken) sendAuthRequest();
    });

    // Listen for messages
    ws.addEventListener("message", async (event) => {
      console.log("Message from server ", event.data);
      const jsonData = JsonSuperParse(event.data);
      const data = baseDataSchema.parse(jsonData);

      // auth sucessful!
      if (data.dataType === "auth-ack") {
        const { error } = authAckSchema.parse(jsonData);
        if (error) return console.error("Error auth-ing with WS server");
        else console.log("Sucess! Auth'd with WS server.");
        inviteEmitter.emit("authSuccess");
      }

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

      if (data.dataType === "error-group-info") {
        const data = errorGroupInfoSchema.parse(jsonData);
        emitter.emit("errorGroupInfo", data);
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
        // setCurrentChatId(newDmData.id);
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

      // Update/Set User information
      if (data.dataType === "set-user-info") {
        const data = setUserInfoSchema.parse(jsonData);
        const { userId, name, handle, accentColor } = data;

        // Zustand store actions
        const updateInfo = useUserStore.getState().updateInfo;
        const user = useUserStore.getState().user;
        const updateReq = useRequestsStore.getState().updateUserInfoInRequests;
        const setAccentColor = usePreferenceStore.getState().setAccentColor;

        // Only update info if current user ID and data user ID match
        if (userId === user.id) {
          updateInfo(name, handle);
          setAccentColor(accentColor);
        }
        // Else, update user info in requests
        else {
          updateReq(userId, name, handle);
        }

        // Update this user's info in chat messages and members
        const updateChats = useChatsStore.getState().updateUserInfoInChats;
        updateChats(userId, name, handle, accentColor);

        emitter.emit("userUpdated", userId);
      }

      if (data.dataType === "error-user-info") {
        const errorData = errorUserInfoSchema.parse(jsonData);
        emitter.emit("userUpdateError", errorData);
      }

      // remove member from group
      if (data.dataType === "remove-member") {
        const removedMemberData = removeMemberSchema.parse(jsonData);
        // Update chats store
        const removeMember = useChatsStore.getState().removeMemberFromGroup;
        removeMember(removedMemberData.groupId, removedMemberData.memberId);
        // event emitter
        emitter.emit("memberKicked", removedMemberData);
      }

      // update images
      if (data.dataType === "update-image") {
        const { objectType, id } = updateImageSchema.parse(jsonData);

        // Reset image functions
        const currentUser = useUserStore.getState().user;
        const resetUser = useUserStore.getState().resetLastImageUpdate;
        const resetRequest = useRequestsStore.getState().resetLastImageUpdate;
        const resetGroup = useChatsStore.getState().resetLastGroupImageUpdate;
        const resetUserChats =
          useChatsStore.getState().resetLastUserImageUpdate;

        if (objectType === "user") {
          resetUserChats(id);
          if (id === currentUser.id) resetUser();
          else {
            // resetUserChats(id);
            resetRequest(id);
          }
        }

        if (objectType === "group") resetGroup(id);
      }

      // join group
      if (data.dataType === "join-group-ack") {
        // parse data, emit events
        const ackData = joinGroupAckSchema.parse(jsonData);
        inviteEmitter.emit("gotJoinGroupAck", ackData);
        emitter.emit("gotJoinGroupAck", ackData);

        // Add new group to zustand chats store
        const createNewGroup = useChatsStore.getState().createNewGroup;
        const { data: groupData } = await fetchChatById(ackData.groupId);
        if (!groupData) return console.error("Failed to fetch new group!");
        createNewGroup(groupData, true);

        // fetch messages, add them to chat
        const addMessage = useChatsStore.getState().addMessage;
        const { data: newGroupMessages } = await fetchMessages(ackData.groupId);
        if (!newGroupMessages) {
          return console.error("Failed to fetch new messages!!!");
        }

        newGroupMessages.forEach((msgData) =>
          addMessage(ackData.groupId, msgData)
        );
      }
    });

    // get auth token
    const authTokenReceivedHandler = (token: string) => {
      authToken = token;

      if (ws !== undefined && ws.readyState === ws.OPEN) {
        sendAuthRequest();
      }
    };

    // add event listeners
    emitter.on("gotWsAuthToken", authTokenReceivedHandler);
    inviteEmitter.on("gotWsAuthToken", authTokenReceivedHandler);

    return () => {
      // sever websocket connection
      consumers -= 1;
      console.log("Total consumers: ", consumers);
      if (consumers === 0) ws.close();
      console.log("Closed");

      // close event listeners
      emitter.off("gotWsAuthToken", authTokenReceivedHandler);
      inviteEmitter.off("gotWsAuthToken", authTokenReceivedHandler);
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
    sendKickMember,
    sendJoinGroup,
  };
}
