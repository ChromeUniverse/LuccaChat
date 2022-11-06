import React from "react";
import creeper from '../assets/creeper.webp'
import { useChatsStore } from "../zustand/chats-store";

interface Props {
  name: string;
  members: number;
  chatId?: string;
}

function Group({ name, members, chatId }: Props) {

  const currentChatId = useChatsStore(state => state.currentChatId);
  const setChatId = useChatsStore(state => state.setCurrentChatId);

  return (
    <div
      className={`
        px-3 py-2 w-full flex items-center gap-3 hover:bg-slate-200 rounded-lg cursor-pointer
        ${chatId === currentChatId ? 'bg-slate-200' : ''}
      `}
      onClick={() => {
        if (chatId) setChatId(chatId);
      }}
    >
      {/* Avatar */}
      <img className="w-14 h-14 rounded-full" src={creeper} alt="" />

      {/* Group Name */}
      <div className="flex flex-col">
        <h3 className="font-normal text-xl">{name}</h3>
        <p className="font-normal text-sm">
          {members.toLocaleString()} members
        </p>
      </div>
    </div>
  );
}

export default Group;
