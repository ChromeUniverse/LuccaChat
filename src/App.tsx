// React
import { useState } from "react";

// Components
import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";
import InfoPanel from "./components/InfoPanel";
import AddChat from "./components/modals/AddChat";

// Zustand
import { useInfoStore } from './zustand/info-panel-store';
import { GroupType, UserType } from "./data";
import { useModalStore } from "./zustand/modals-store";
import AddFriend from "./components/modals/AddFriend";
import CreateGroup from "./components/modals/CreateGroup";

function App() {

  const infoOpen = useInfoStore(state => state.infoOpen);
  const infoData = useInfoStore(state => state.data);

  const modalState = useModalStore(state => state.modalState);

  return (
    <div className="flex w-screen h-screen relative">
      {/* Modal wrapper */}
      {modalState && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          {/* Dark translucent background */}
          <div className="absolute z-10 bg-slate-900 w-full h-full opacity-80"></div>
          {modalState === 'add-chat' && <AddChat />}
          {modalState === 'add-friend' && <AddFriend />}
          {modalState === 'create-group' && <CreateGroup />}          
        </div>
      )}

      <Sidebar />
      <div className="h-screen w-0.5 bg-slate-100 flex-shrink-0"></div>
      <Chat />

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
