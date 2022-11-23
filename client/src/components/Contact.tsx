import React from "react";
import avatar from "../assets/avatar.jpeg";
import { UserType } from "../data";
import { useChatsStore } from "../zustand/chats-store";
import { useInfoStore } from "../zustand/info-panel-store";

interface Props {
  user: UserType;
  chatId?: string;
  highlight?: boolean;
  openInfoOnClick?: boolean;
}

function Contact({
  user,
  chatId,
  highlight = false,
  openInfoOnClick = false,
}: Props) {
  const currentChatId = useChatsStore((state) => state.currentChatId);
  const setChatId = useChatsStore((state) => state.setCurrentChatId);
  const showUserInfo = useInfoStore((state) => state.showUserInfo);

  return (
    <div
      className={`
        px-3 py-2 w-full flex items-center gap-3 hover:bg-slate-200 rounded-lg cursor-pointer
        ${chatId === currentChatId ? "bg-slate-200" : ""}
        ${highlight ? "bg-sky-200 hover:bg-sky-200 hover:bg-opacity-50" : ""}
      `}
      onClick={() => {
        if (chatId) setChatId(chatId);
        if (openInfoOnClick) showUserInfo(user);
      }}
    >
      {/* Avatar */}
      <img className="w-14 h-14 rounded-full" src={user.pfp_url} alt="" />

      {/* Contact Name */}
      <div className="flex flex-col">
        <h3 className="font-normal text-xl">{user.name}</h3>
        <p className="font-bold text-sm">@{user.handle}</p>
      </div>
    </div>
  );
}

export default Contact;
