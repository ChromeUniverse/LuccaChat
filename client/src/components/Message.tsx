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

interface MenuLineProps {
  text: string;
  icon: IconDefinition;
  danger?: boolean;
  onClickArgs?: any[];
  onClick?: (...args: any) => any;
  setOpen?: Dispatch<SetStateAction<string | null>>;
}

// A line inside the dropdown menu
function MenuLine({
  text,
  icon,
  danger = false,
  onClickArgs = [],
  onClick = () => {},
  setOpen = () => {},
}: MenuLineProps) {
  return (
    <div
      className={`flex w-full justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-slate-400 hover:bg-opacity-30 ${
        danger ? "mt-2" : ""
      }`}
      onClick={() => {
        onClick(...onClickArgs);
        setOpen(null);
      }}
    >
      <p className={danger ? "text-red-500 font-semibold" : ""}>{text}</p>
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
}: DropdownMenuProps) {
  const currentUser = useUserStore((state) => state.user);

  return (
    <div
      className={`
        absolute -top-2 right-14 px-2 py-2 w-52 bg-slate-300 rounded-md flex flex-col gap-1 transition-all select-none
        ${menuOpen ? "z-10 -top-2" : "-z-10 -top-6"}
      `}
    >
      <MenuLine text="Copy content" icon={faClipboard} />
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
}

function Message({
  chatId,
  messageId,
  open,
  setOpen,
  sender,
  content,
  handleClick,
}: Props) {
  const showUserInfo = useInfoStore((state) => state.showUserInfo);
  const { deleteMessage } = useWebSockets();

  return (
    <div
      className={`
      group relative pl-6 pr-10 grid grid-cols-[3rem_auto] items-start gap-3 py-4 hover:bg-slate-300 rounded-lg hover:bg-opacity-40
      ${open ? "bg-slate-300 bg-opacity-40" : ""}
    `}
    >
      {/* User Avatar */}
      <div className="bg-slate-900 w-12 h-12 flex items-center justify-center rounded-full select-none">
        <img className="w-[90%] rounded-full" src={sender.pfp_url} alt="" />
      </div>

      {/* Messsage content */}
      <div className="flex flex-col">
        <h3 className="font-semibold text-xl text-blue-900">{sender.name}</h3>
        <p className="">{content}</p>
      </div>

      {/* Options menu button */}
      <div
        className={`
          absolute -top-2 right-4 group-hover:flex w-8 h-8 rounded-lg bg-slate-300 items-center justify-center cursor-pointer hover:brightness-95
          ${open ? "flex brightness-95" : "hidden"}
        `}
        onClick={() => handleClick(messageId)}
      >
        {/* Ellipsis icon */}
        <FontAwesomeIcon className="text-slate-500" icon={faEllipsisH} />
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
      />
    </div>
  );
}

export default Message;
