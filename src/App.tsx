import { useState } from "react";
import reactLogo from "./assets/react.svg";
import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="grid grid-cols-[330px_auto] w-screen h-screen">
      <Sidebar />
      <Chat />
    </div>
  );
}

export default App;
