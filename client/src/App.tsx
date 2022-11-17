// React
import { createContext, useEffect } from "react";

// Components
import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";
import InfoPanel from "./components/InfoPanel";

// Zustand
import { useInfoStore } from "./zustand/info-panel-store";
import { GroupType, UserType } from "./data";

// Auth'd user
import { useChatsStore, user } from "./zustand/chats-store";
import ModalWrapper from "./components/modals/ModalWrapper";
import Home from "./components/Home";
import PublicGroupBrowser, {
  useBrowserStore,
} from "./components/PublicGroupBrowser";

export const AuthContext = createContext(user);

function App() {
  const infoOpen = useInfoStore((state) => state.infoOpen);
  const infoData = useInfoStore((state) => state.data);
  const currentChatId = useChatsStore((state) => state.currentChatId);
  const browserOpen = useBrowserStore((state) => state.open);

  return (
    <AuthContext.Provider value={user}>
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
    </AuthContext.Provider>
  );
}

export default App;
