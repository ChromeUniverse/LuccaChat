// React
import { createContext, useEffect } from "react";

// Components
import Chat from "../components/Chat";
import Sidebar from "../components/Sidebar";
import InfoPanel from "../components/InfoPanel";

// Zustand
import { useInfoStore } from "../zustand/info-panel-store";
import { GroupType, UserType } from "../data";

// Auth'd user
import { useChatsStore } from "../zustand/chats-store";
import ModalWrapper from "../components/modals/ModalWrapper";
import Home from "../components/Home";
import PublicGroupBrowser, {
  useBrowserStore,
} from "../components/PublicGroupBrowser";
import useWebSockets from "../hooks/useWebSockets";

// Event Emitter
import mitt from "mitt";
import fetchChats from "../api/fetchChats";
import fetchMessages from "../api/fetchMessages";
import fetchRequests from "../api/fetchRequests";
import { useRequestsStore } from "../zustand/requests-store";
import { useUserStore } from "../zustand/user-store";
import fetchCurrentUser from "../api/fetchCurrentUser";

import { z } from "zod";
import {
  errorGroupInfoSchema,
  errorUserInfoSchema,
  joinGroupAckSchema,
  removeMemberSchema,
} from "../../../server/src/zod/schemas";
import axios, { AxiosError } from "axios";

type Events = {
  addChatMessage: any;
  deleteChatMessage: any;
  ackRequest: any;
  errorRequest: string;
  groupCreated: any;
  groupUpdated: string;
  groupDeleted: string;
  inviteSet: string;
  userUpdated: string;
  userUpdateError: z.infer<typeof errorUserInfoSchema>;
  memberKicked: z.infer<typeof removeMemberSchema>;
  errorGroupInfo: z.infer<typeof errorGroupInfoSchema>;
  gotJoinGroupAck: z.infer<typeof joinGroupAckSchema>;
};

export const emitter = mitt<Events>();

function App() {
  const infoOpen = useInfoStore((state) => state.infoOpen);
  const infoData = useInfoStore((state) => state.data);
  const currentChatId = useChatsStore((state) => state.currentChatId);
  const browserOpen = useBrowserStore((state) => state.open);
  useWebSockets();

  useEffect(() => {
    async function chatsInit() {
      // Zustand store actions
      const createNewDM = useChatsStore.getState().createNewDM;
      const createNewGroup = useChatsStore.getState().createNewGroup;
      const addMessage = useChatsStore.getState().addMessage;
      const addRequest = useRequestsStore.getState().addRequest;
      const userInfoInit = useUserStore.getState().userInfoInit;

      // Initialize user profile
      const { id, name, handle } = await fetchCurrentUser();
      if (!id) return window.location.replace("/");
      userInfoInit(id, name, handle);

      // Fetching chats
      const { data: chats } = await fetchChats();
      if (!chats) return console.error("Failed to fetch chats");
      chats.forEach(async (chatData) => {
        // Creating a new chat
        chatData.type === "DM"
          ? createNewDM(chatData)
          : createNewGroup(chatData);

        // Fetching this chat's messages
        const { data: messages } = await fetchMessages(chatData.id);
        if (!messages) {
          return console.error(
            `Failed to fetch messages for chat ${chatData.id}`
          );
        }
        messages.forEach((msgData) => addMessage(chatData.id, msgData));
      });

      // Fetching requests
      const { data: requests } = await fetchRequests();
      if (!requests) return console.error("Failed to fetch requests");
      requests.forEach((reqData) => addRequest(reqData));
    }
    chatsInit();
  }, []);

  return (
    <div className="flex w-screen h-screen relative">
      <ModalWrapper />
      <Sidebar />

      {/* Display Home or Chat views */}
      {currentChatId === null ? (
        browserOpen ? (
          <PublicGroupBrowser />
        ) : (
          <Home />
        )
      ) : (
        <>
          <div className="h-screen w-0.5 bg-slate-100 flex-shrink-0"></div>
          <Chat />
        </>
      )}

      {/* Display info panel */}
      {infoOpen !== null && (
        <>
          <div className="h-screen w-0.5 bg-slate-100 flex-shrink-0"></div>
          {infoOpen === "user" && (
            <InfoPanel type={infoOpen} user={infoData as UserType} />
          )}
          {infoOpen === "group" && (
            <InfoPanel type={infoOpen} group={infoData as GroupType} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
