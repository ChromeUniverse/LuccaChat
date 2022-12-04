import React from "react";
import avatar from "../assets/avatar.jpeg";
import { UserType } from "../data";
import { useChatsStore } from "../zustand/chats-store";
import { useInfoStore } from "../zustand/info-panel-store";
import { usePreferenceStore } from "../zustand/userPreferences";
import { useBrowserStore } from "./PublicGroupBrowser";

interface Props {
  user: UserType;
  chatId?: string;
  highlight?: boolean;
  openInfoOnClick?: boolean;
  lastImageUpdate?: Date;
}

function Contact({
  user,
  chatId,
  highlight = false,
  openInfoOnClick = false,
  lastImageUpdate = new Date(),
}: Props) {
  const currentChatId = useChatsStore((state) => state.currentChatId);
  const setChatId = useChatsStore((state) => state.setCurrentChatId);
  const showUserInfo = useInfoStore((state) => state.showUserInfo);
  const setBrowserOpen = useBrowserStore((state) => state.setOpen);
  const accentColor = usePreferenceStore((state) => state.accentColor);

  return (
    <div
      className={`
        px-3 py-2 w-full flex items-center gap-3 rounded-lg cursor-pointer
        ${chatId === currentChatId ? "bg-slate-200 dark:bg-slate-800" : ""}
        ${
          highlight
            ? `bg-${accentColor}-600 bg-opacity-30 hover:bg-opacity-20 dark:hover:bg-opacity-50`
            : "hover:bg-slate-200 dark:hover:bg-slate-800"
        }
      `}
      onClick={() => {
        if (chatId) {
          setChatId(chatId);
          setBrowserOpen(false);
        }
        if (openInfoOnClick) showUserInfo(user);
      }}
    >
      {/* Avatar */}
      <img
        className="w-14 h-14 rounded-full object-cover"
        src={`${import.meta.env.VITE_BACKEND_URL}/avatars/${
          user.id
        }.jpeg?${lastImageUpdate.getTime()}`}
        alt=""
      />

      {/* Contact Name */}
      <div className="flex flex-col">
        <h3 className="font-normal text-xl">{user.name}</h3>
        <p className="font-normal text-sm dark:text-slate-400">
          @{user.handle}
        </p>
      </div>
    </div>
  );
}

export default Contact;
