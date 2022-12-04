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
import { usePreferenceStore } from "../zustand/userPreferences";

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

function Divider() {
  return (
    <div className="h-screen w-[2px] bg-slate-100 dark:bg-slate-900 flex-shrink-0"></div>
  );
}

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
      const { data: user } = await fetchCurrentUser();
      if (!user) return window.location.replace("/");
      userInfoInit(user.id, user.name, user.handle);

      // Set accent color
      const setAccentColor = usePreferenceStore.getState().setAccentColor;
      setAccentColor(user.accentColor);

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

  const darkMode = usePreferenceStore((state) => state.darkMode);

  console.log("Dark mode is:", darkMode);

  return (
    <div
      className={`flex w-screen h-screen relative ${
        darkMode ? "dark text-white" : ""
      }`}
    >
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
          <Divider />
          <Chat />
        </>
      )}

      {/* Display info panel */}
      {infoOpen !== null && (
        <>
          <Divider />
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
