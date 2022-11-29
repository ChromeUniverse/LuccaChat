import React from "react";
import creeper from "../assets/creeper.webp";
import { useChatsStore } from "../zustand/chats-store";

interface Props {
  name: string;
  members: number;
  chatId?: string;
  lastImageUpdate?: Date;
}

function Group({ name, members, chatId, lastImageUpdate = new Date() }: Props) {
  const currentChatId = useChatsStore((state) => state.currentChatId);
  const setChatId = useChatsStore((state) => state.setCurrentChatId);

  return (
    <div
      className={`
        px-3 py-2 w-full flex items-center gap-3 hover:bg-slate-200 rounded-lg cursor-pointer
        ${chatId === currentChatId ? "bg-slate-200" : ""}
      `}
      onClick={() => {
        if (chatId) setChatId(chatId);
      }}
    >
      {/* Avatar */}
      <img
        className="w-14 h-14 rounded-full object-cover"
        src={`${
          import.meta.env.VITE_BACKEND_URL
        }/avatars/${chatId}.jpeg?${lastImageUpdate.getTime()}`}
        alt=""
      />

      {/* Group Name */}
      <div className="flex flex-col">
        <h3 className="font-normal text-xl">{name}</h3>
        <p className="font-normal text-sm">
          {members.toLocaleString()} members
        </p>
      </div>

      {/* Unread message count */}
      {/* {chatId && unread !== 0 && (
        <div className="min-w-[1.5rem] px-2 h-6 bg-slate-400 rounded-full ml-auto flex justify-center items-center text-slate-100 font-bold text-sm">
          {unread}
        </div>
      )} */}
    </div>
  );
}

export default Group;
