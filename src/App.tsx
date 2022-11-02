import { useState } from "react";
import reactLogo from "./assets/react.svg";
import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="flex w-screen h-screen">
      <Sidebar />
      <div className="h-screen w-1 bg-slate-100"></div>
      <Chat />
    </div>
  );
}

export default App;
