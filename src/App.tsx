// React
import { useState } from "react";

// Components
import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";
import InfoPanel from "./components/InfoPanel";

// Zustand
import { useInfoStore } from './zustand/info-panel-store';
import { GroupType, UserType } from "./data";

function App() {

  const infoOpen = useInfoStore(state => state.infoOpen);
  const infoData = useInfoStore(state => state.data);

  return (
    <div className="flex w-screen h-screen">
      <Sidebar />
      <div className="h-screen w-0.5 bg-slate-100 flex-shrink-0"></div>
      <Chat />

      {infoOpen !== null && (
        <>
          <div className="h-screen w-0.5 bg-slate-100 flex-shrink-0"></div>
          {infoOpen === 'user' && <InfoPanel type={infoOpen} user={infoData as UserType} />}
          {infoOpen === 'group' && <InfoPanel type={infoOpen} group={infoData as GroupType} />}
        </>
      )}
    </div>
  );
}

export default App;
