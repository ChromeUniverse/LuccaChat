// React
import { createContext, useEffect, useState } from "react";

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
  gotWsAuthToken: string;
};

export const emitter = mitt<Events>();

function Spinner() {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="mr-0 w-20 h-20 text-gray-200 animate-spin dark:text-gray-900 fill-blue-500"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

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

  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

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
      emitter.emit("gotWsAuthToken", user.wsAuthToken);

      // Set accent color
      const setAccentColor = usePreferenceStore.getState().setAccentColor;
      setAccentColor(user.accentColor);

      // Fetching chats
      const { data: chats } = await fetchChats();
      if (!chats) return setError("Failed to fetch chats");
      chats.forEach(async (chatData) => {
        // Creating a new chat
        chatData.type === "DM"
          ? createNewDM(chatData)
          : createNewGroup(chatData);

        // Fetching this chat's messages
        const { data: messages } = await fetchMessages(chatData.id);
        if (!messages) {
          return setError(`Failed to fetch messages for chat ${chatData.id}`);
        }
        messages.forEach((msgData) => addMessage(chatData.id, msgData));
      });

      // Fetching requests
      const { data: requests } = await fetchRequests();
      if (!requests) return setError("Failed to fetch requests");
      requests.forEach((reqData) => addRequest(reqData));

      // Finished!
      setDone(true);
    }
    chatsInit();
  }, []);

  const darkMode = usePreferenceStore((state) => state.darkMode);

  if (!done) {
    return (
      <div
        className={`          
          flex w-screen h-screen relative justify-center items-center
          ${darkMode ? "dark text-white bg-slate-800" : "bg-slate-300"}
        `}
      >
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-500 text-6xl font-semibold">Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <Spinner />
        )}
      </div>
    );
  }

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
