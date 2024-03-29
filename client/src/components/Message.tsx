import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import avatar from "../assets/avatar.jpeg";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-regular-svg-icons";
import {
  faCircleInfo,
  faEllipsisH,
  faTrash,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { UserType } from "../data";
import { useInfoStore } from "../zustand/info-panel-store";
import { useChatsStore } from "../zustand/chats-store";
import useWebSockets from "../hooks/useWebSockets";
import { useUserStore } from "../zustand/user-store";
import { useDebouncedCallback } from "use-debounce";
import { copyInviteLinkToClipboard, copyMsgContentToClipboard } from "../misc";
import { usePreferenceStore } from "../zustand/userPreferences";

interface MenuLineProps {
  text: string;
  icon: IconDefinition;
  danger?: boolean;
  onClickArgs?: any[];
  onClick?: (...args: any) => any;
  setOpen?: Dispatch<SetStateAction<string | null>>;
  clickToCopy?: boolean;
}

// A line inside the dropdown menu
function MenuLine({
  text,
  icon,
  danger = false,
  onClickArgs = [],
  onClick = () => {},
  setOpen = () => {},
  clickToCopy = false,
}: MenuLineProps) {
  const [btnText, setBtnText] = useState(text);

  const debouncedResetBtnText = useDebouncedCallback(() => {
    setBtnText(text);
  }, 1000);

  return (
    <div
      className={`flex w-full justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-slate-400 hover:bg-opacity-30 ${
        danger ? "mt-2" : ""
      }`}
      onClick={() => {
        onClick(...onClickArgs);
        setOpen(null);
        if (clickToCopy) {
          setBtnText("Copied!");
          debouncedResetBtnText();
        }
      }}
    >
      <p className={danger ? "text-red-500 font-semibold" : ""}>{btnText}</p>
      <FontAwesomeIcon
        className={`w-6 text-center ${
          danger ? "text-red-500 font-semibold" : ""
        }`}
        icon={icon}
        size="lg"
      />
    </div>
  );
}

interface DropdownMenuProps {
  chatId: string;
  messageId: string;
  menuOpen: boolean;
  setOpen: Dispatch<SetStateAction<string | null>>;
  sender: UserType;
  showInfo: (user: UserType) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  content: string;
}

// The message's dropdown menu
function DropdownMenu({
  chatId,
  messageId,
  menuOpen,
  setOpen,
  sender,
  showInfo,
  deleteMessage,
  content,
}: DropdownMenuProps) {
  const currentUser = useUserStore((state) => state.user);

  return (
    <div
      className={`
        absolute -top-2 right-14 px-2 py-2 w-52 bg-slate-300 dark:bg-slate-700 dark:text-slate-300 rounded-md flex flex-col gap-1 transition-all select-none
        ${menuOpen ? "z-10 -top-2" : "-z-10 -top-6"}
      `}
    >
      <MenuLine
        text="Copy content"
        icon={faClipboard}
        clickToCopy
        onClick={() => copyMsgContentToClipboard(content)}
      />
      {sender.id !== currentUser.id && (
        <MenuLine
          text="Sender info"
          icon={faCircleInfo}
          onClickArgs={[sender]}
          onClick={showInfo}
          setOpen={setOpen}
        />
      )}
      {sender.id === currentUser.id && (
        <MenuLine
          text="Delete message"
          icon={faTrash}
          danger
          onClick={deleteMessage}
          onClickArgs={[chatId, messageId]}
        />
      )}
    </div>
  );
}

interface Props {
  chatId: string;
  messageId: string;
  content: string;
  sender: UserType;
  open: boolean;
  setOpen: Dispatch<SetStateAction<string | null>>;
  handleClick: (id: string) => void;
  lastImageUpdate: Date;
}

function Message({
  chatId,
  messageId,
  open,
  setOpen,
  sender,
  content,
  handleClick,
  lastImageUpdate,
}: Props) {
  const accentColor = usePreferenceStore((state) => state.accentColor);
  const showUserInfo = useInfoStore((state) => state.showUserInfo);
  const { deleteMessage } = useWebSockets();

  return (
    <div
      className={`
      group relative pl-6 pr-10 grid grid-cols-[3rem_auto] items-start gap-3 py-4 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg hover:bg-opacity-40 dark:hover:bg-opacity-40
      ${
        open
          ? "bg-slate-300 bg-opacity-40 dark:bg-slate-700 dark:bg-opacity-40"
          : ""
      }
    `}
    >
      {/* User Avatar */}
      <div className="w-12 h-12 flex items-center justify-center rounded-full select-none">
        <img
          className="w-12 h-12 rounded-full"
          src={`${import.meta.env.VITE_BACKEND_URL}/avatars/${
            sender.id
          }.jpeg?${lastImageUpdate}`}
          alt=""
        />
      </div>

      {/* Messsage content */}
      <div className="flex flex-col">
        {/* Sender display name + accent color */}
        <h3
          className={`font-semibold text-xl text-${sender.accentColor}-500 select-text`}
        >
          {sender.name}
        </h3>
        {/* Message text content */}
        <p className="select-text">{content}</p>
      </div>

      {/* Options menu button */}
      <div
        className={`
          absolute -top-2 right-4 group-hover:flex w-8 h-8 rounded-lg bg-slate-300 dark:bg-slate-600 items-center justify-center cursor-pointer hover:brightness-95
          ${open ? "flex brightness-95" : "hidden"}
        `}
        onClick={() => handleClick(messageId)}
      >
        {/* Ellipsis icon */}
        <FontAwesomeIcon
          className="text-slate-500 dark:text-slate-300"
          icon={faEllipsisH}
        />
      </div>

      {/* Dropdown menu */}
      {/* TODO: finish this component!!! */}
      <DropdownMenu
        chatId={chatId}
        messageId={messageId}
        menuOpen={open}
        setOpen={setOpen}
        sender={sender}
        showInfo={showUserInfo}
        deleteMessage={deleteMessage}
        content={content}
      />
    </div>
  );
}

export default Message;
