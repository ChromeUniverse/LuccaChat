import React, { useEffect, useRef, useState } from "react";

// Components
import Message from "./Message";
import TextareaAutosize from "react-textarea-autosize";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faCircleInfo,
  faEllipsisV,
  faGear,
  faPaperPlane,
  faTrash,
  faVolumeXmark,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { faClipboard } from "@fortawesome/free-regular-svg-icons";

// Event emitter
import { emitter } from "../routes/App";

// Zustand store
import { useInfoStore } from "../zustand/info-panel-store";
import { useChatsStore } from "../zustand/chats-store";
import { useModalStore } from "../zustand/modals-store";
import { useUserStore } from "../zustand/user-store";

// Hooks
import useWebSockets from "../hooks/useWebSockets";
import { useDebouncedCallback } from "use-debounce";

// typescript type defs
import { DMType, GroupType, UserType } from "../data";
import { copyInviteLinkToClipboard } from "../misc";

type MenuLineProps = {
  text: string;
  icon: IconDefinition;
  danger?: boolean;
  clickToCopy?: boolean;
  onClickArgs?: any;
  onClick?: (input: any) => any;
  setOptionsOpen?: (value: boolean) => void;
};

// A line inside the dropdown menu
function MenuLine({
  text,
  icon,
  danger = false,
  clickToCopy = false,
  onClickArgs,
  onClick = () => {},
  setOptionsOpen = () => {},
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
        console.log("Clicked!");
        onClick(onClickArgs);
        setOptionsOpen(false);
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

type DropdownMenuProps = {
  chat: GroupType | DMType;
  menuOpen: boolean;
  infoData: UserType | GroupType;
  showInfo: ((group: GroupType) => void) | ((user: UserType) => void);
  setOptionsOpen: (value: boolean) => void;
};

// Chat option dropdown menu
function DropdownMenu({
  chat,
  menuOpen,
  infoData,
  showInfo,
  setOptionsOpen,
}: DropdownMenuProps) {
  const setModalState = useModalStore((state) => state.setModalState);
  const currentUser = useUserStore((state) => state.user);

  return (
    <div
      className={`
        absolute -top-2 right-14 px-2 py-2 w-52 bg-slate-300 dark:bg-slate-700 dark:text-slate-300 rounded-md flex flex-col gap-1 transition-all select-none
        ${menuOpen ? "z-10 -top-2" : "-z-10 -top-4"}
      `}
    >
      {chat.type === "group" && (
        <>
          <MenuLine
            text="Group info"
            icon={faCircleInfo}
            onClick={showInfo}
            onClickArgs={infoData}
            setOptionsOpen={setOptionsOpen}
          />
          {chat.createdBy.id === currentUser.id && (
            <MenuLine
              text="Group settings"
              icon={faGear}
              setOptionsOpen={setOptionsOpen}
              onClick={setModalState}
              onClickArgs={"group-settings"}
            />
          )}
          <MenuLine
            text="Copy invite link"
            icon={faClipboard}
            clickToCopy
            onClick={() => copyInviteLinkToClipboard(chat)}
          />
          {/* <MenuLine text="Mute group" icon={faVolumeXmark} /> */}
          {chat.createdBy.id === currentUser.id ? (
            <MenuLine
              text="Delete group"
              icon={faTrash}
              danger
              onClick={setModalState}
              onClickArgs={"delete-group"}
              setOptionsOpen={setOptionsOpen}
            />
          ) : (
            <MenuLine
              text="Leave group"
              icon={faArrowRightFromBracket}
              danger
              onClick={setModalState}
              onClickArgs={"leave-group"}
              setOptionsOpen={setOptionsOpen}
            />
          )}
        </>
      )}
      {chat.type === "dm" && (
        <>
          <MenuLine
            text="Contact info"
            icon={faCircleInfo}
            onClick={showInfo}
            onClickArgs={infoData}
            setOptionsOpen={setOptionsOpen}
          />
          {/* <MenuLine text="Mute group" icon={faVolumeXmark} /> */}
        </>
      )}
    </div>
  );
}

function Chat() {
  // Info panel
  const showGroupInfo = useInfoStore((state) => state.showGroupInfo);
  const showUserInfo = useInfoStore((state) => state.showUserInfo);
  const closeInfo = useInfoStore((state) => state.closeInfo);

  // Fetch actions and data for this chat from zustand store
  const setInputBuffer = useChatsStore((state) => state.setInputBuffer);
  const currentChatId = useChatsStore((state) => state.currentChatId);
  const chats = useChatsStore((state) => state.chats);

  // fetch messages for current chat
  const chat = chats.find((c) => c.id === currentChatId) as GroupType | DMType;
  const messages = chat.messages;

  // Message dropdown
  const [open, setOpen] = useState<string | null>(null);

  // Chat dropdown
  const [optionsOpen, setOptionsOpen] = useState(false);

  // Jump to bottom button
  const [showJumpButton, setShowJumpButton] = useState(false);

  // Message input
  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    setInputBuffer(chat.id, e.currentTarget.value);
  }

  // Websockets
  const { sendMessage } = useWebSockets();

  function handleSend() {
    if (chat.inputBuffer === "") return;
    // addMessage(chat.id, chat.inputBuffer);
    sendMessage(chat.inputBuffer);
    setInputBuffer(chat.id, "");
  }

  function handleClick(id: string): void {
    open === id ? setOpen(null) : setOpen(id);
    setOptionsOpen(false);
  }

  // Close info panel every time chat changes
  useEffect(() => {
    closeInfo();
    setOpen(null);
    setOptionsOpen(false);
    scrollToBottom(false);
    setShowJumpButton(false);
  }, [currentChatId]);

  const infoOpen = useInfoStore((state) => state.infoOpen);
  const closeChat = useChatsStore((state) => state.closeChat);
  const modalState = useModalStore((state) => state.modalState);

  // Event handlers and other side effects side
  useEffect(() => {
    // Escape key click handler
    const handleEscPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modalState !== null) return;
        if (infoOpen !== null) return closeInfo();
        return closeChat();
      }
    };
    window.addEventListener("keydown", handleEscPress);

    return () => {
      window.removeEventListener("keydown", handleEscPress);
    };
  }, [infoOpen, modalState]);

  // Refs for scrolling purposes
  const messagesRef = useRef(null);
  const messagesEndRef = useRef(null);

  function getScrollDiff() {
    const msg = messagesRef.current as unknown as HTMLElement;
    return msg.scrollHeight - (msg.scrollTop + msg.clientHeight);
  }

  function handleScroll() {
    let newShowJumpButton: boolean;
    if (getScrollDiff() > 300) newShowJumpButton = true;
    else newShowJumpButton = false;
    setShowJumpButton(newShowJumpButton);
    return newShowJumpButton;
  }

  function scrollToBottom(smooth = true) {
    const bottom = messagesEndRef.current as unknown as HTMLElement;
    bottom.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }

  // Scroll to bottom when a new message is received
  useEffect(() => {
    const onChatMessage = () => {
      setTimeout(() => {
        const newShowJumpButton = handleScroll();
        console.log(`newShowJumpButton is ${newShowJumpButton}`);
        if (!newShowJumpButton) scrollToBottom();
      }, 50);
    };

    emitter.on("addChatMessage", onChatMessage);
    return () => emitter.off("addChatMessage", onChatMessage);
  }, []);

  return (
    <main className="flex flex-col bg-slate-200 dark:bg-slate-800 h-screen w-full overflow-x-hidden">
      {/* Chat Header */}
      <div className="relative w-full bg-slate-300 dark:bg-slate-700 pl-5 pr-8 h-20 flex items-center flex-shrink-0">
        {/* Chat profile picture */}
        <div className="w-12 h-12 flex flex-shrink-0 items-center justify-center rounded-full select-none">
          <img
            className="w-12 h-12 rounded-full object-cover"
            src={
              chat.type === "dm"
                ? `${import.meta.env.VITE_BACKEND_URL}/avatars/${
                    chat.contact.id
                  }.jpeg?${chat.lastImageUpdate.getTime()}`
                : `${import.meta.env.VITE_BACKEND_URL}/avatars/${
                    chat.id
                  }.jpeg?${chat.lastImageUpdate.getTime()}`
            }
            alt=""
          />
        </div>

        {/* Name */}
        <div className="flex flex-col pl-3">
          {chat.type === "group" && (
            <>
              <h3 className="font-normal text-xl">{chat.name}</h3>
              <p className="font-normal text-sm dark:text-slate-400">
                {chat.members.length} participants
              </p>
            </>
          )}
          {chat.type === "dm" && (
            <>
              <h3 className="font-normal text-xl">{chat.contact.name}</h3>
            </>
          )}
        </div>

        {/* Ellipsis button */}
        <div
          className={`
            ml-auto w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer hover:brightness-90
            ${optionsOpen ? "brightness-90 bg-slate-300 dark:bg-slate-600" : ""}
          `}
          onClick={() => {
            setOpen(null);
            setOptionsOpen((prev) => !prev);
          }}
        >
          <FontAwesomeIcon
            className="text-2xl text-slate-600 dark:text-slate-300"
            icon={faEllipsisV}
          />
        </div>

        {/* Dropdown options menu */}
        <div className="absolute -right-6 top-24 select-none">
          <DropdownMenu
            chat={chat}
            menuOpen={optionsOpen}
            infoData={chat.type === "dm" ? chat.contact : chat}
            showInfo={chat.type === "dm" ? showUserInfo : showGroupInfo}
            setOptionsOpen={setOptionsOpen}
          />
        </div>
      </div>

      {/* Messages container */}
      <div
        className="flex flex-col px-4 pt-4 pb-4 w-full h-full overflow-y-auto"
        onScroll={handleScroll}
        ref={messagesRef}
      >
        {messages.map((m) => (
          <Message
            key={m.id}
            chatId={chat.id}
            messageId={m.id}
            sender={m.sender}
            content={m.content}
            open={open === m.id}
            setOpen={setOpen}
            handleClick={handleClick}
            lastImageUpdate={m.lastImageUpdate}
          />
        ))}
        <div id="messages-end" ref={messagesEndRef} />
      </div>

      {/* Chat footer */}
      <div className="flex-shrink-0 min-h-[5rem] w-full px-10 py-4 bg-slate-300 dark:bg-slate-700 flex flex-row items-end gap-4 relative">
        {/* Scroll to bottom button */}
        {showJumpButton && (
          <div className="absolute z-10 -top-12 left-0 right-0 flex justify-center">
            <button
              className="bg-slate-400 dark:bg-slate-700 text-lg text-slate-100 font-semibold px-6 py-1 rounded-full outline-none"
              onClick={() => scrollToBottom()}
            >
              Scroll to Bottom
            </button>
          </div>
        )}

        {/* Text input */}
        <TextareaAutosize
          className="bg-slate-200 dark:bg-slate-800 rounded-md py-3 px-4 flex-grow outline-none resize-none"
          placeholder="Type a message..."
          value={chat.inputBuffer}
          maxRows={10}
          onInput={handleInput}
        />
        {/* Send button */}
        <div
          className="group bg-slate-200 dark:bg-slate-800 h-12 w-12 rounded-full relative cursor-pointer hover:bg-slate-400 dark:hover:bg-slate-800 dark:hover:bg-opacity-40"
          onClick={handleSend}
        >
          <FontAwesomeIcon
            className="text-slate-500 dark:text-slate-500 absolute top-[14px] left-[12px] group-hover:text-slate-100 dark:group-hover:text-slate-400"
            icon={faPaperPlane}
            size="lg"
          />
        </div>
      </div>
    </main>
  );
}

export default Chat;
