import React, { useEffect, useState } from 'react'

// Test photo
import creeper from '../assets/creeper.webp'
import avatar from '../assets/avatar.jpeg'

// Components
import Message from './Message'
import TextareaAutosize from 'react-textarea-autosize';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightFromBracket, faCircleInfo, faEllipsisV, faGear, faPaperPlane, faVolumeXmark, IconDefinition } from '@fortawesome/free-solid-svg-icons'

// Zustand store
import { useInfoStore } from '../zustand/info-panel-store';
import { useChatsStore } from '../zustand/chats-store';
import { ChatType, DMType, GroupType, UserType } from '../data';


type MenuLineProps = {
  text: string;
  icon: IconDefinition;
  danger?: boolean;
  onClickArgs?: any;
  onClick?: (input: any) => any;
  setOptionsOpen?: (value: boolean) => void;
};

// A line inside the dropdown menu
function MenuLine({text, icon, danger = false, onClickArgs, onClick = () => {}, setOptionsOpen = () => {}} : MenuLineProps) {
  return (
    <div
      className={`flex w-full justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-slate-400 hover:bg-opacity-30 ${
        danger ? "mt-2" : ""
      }`}
      onClick={() => { onClick(onClickArgs);  setOptionsOpen(false); }}
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

type DropdownMenuProps = {
  chatType: 'dm' | 'group';
  menuOpen: boolean;
  infoData: UserType | GroupType;
  showInfo: ((group: GroupType) => void) | ((user: UserType) => void);
  setOptionsOpen: (value: boolean) => void;
};

// The message's dropdown menu
function DropdownMenu({chatType, menuOpen, infoData, showInfo, setOptionsOpen} : DropdownMenuProps) {
  return (
    <div
      className={`
        absolute -top-2 right-14 px-2 py-2 w-52 bg-slate-300 rounded-md flex flex-col gap-1 transition-all select-none
        ${menuOpen ? "z-20 -top-2" : "-z-10 -top-4"}
      `}
    >
      {chatType === "group" && (
        <>
          <MenuLine
            text="Group info"
            icon={faCircleInfo}
            onClick={showInfo}
            onClickArgs={infoData}
            setOptionsOpen={setOptionsOpen}
          />
          <MenuLine text="Group settings" icon={faGear} />
          <MenuLine text="Mute group" icon={faVolumeXmark} />
          <MenuLine text="Leave group" icon={faArrowRightFromBracket} danger />
        </>
      )}
      {chatType === "dm" && (
        <>
          <MenuLine
            text="Contact info"
            icon={faCircleInfo}
            onClick={showInfo}
            onClickArgs={infoData}
            setOptionsOpen={setOptionsOpen}
          />
          <MenuLine text="Mute group" icon={faVolumeXmark} />
        </>
      )}
    </div>
  );
}

function Chat() {


  // Info panel
  const showGroupInfo = useInfoStore(state => state.showGroupInfo);
  const showUserInfo = useInfoStore(state => state.showUserInfo);
  const closeInfo = useInfoStore(state => state.closeInfo);

  // Fetch Messages for this chat
  const chats = useChatsStore(state => state.chats);
  const chatId = useChatsStore(state => state.currentChatId);   
  const addMessage = useChatsStore(state => state.addMessage);
  const setInput = useChatsStore(state => state.setInputBuffer);
  const chat = chats.find((c: ChatType) => c.id === chatId) as GroupType | DMType;
  const messages = chat.messages;

  // Message dropdown
  const [open, setOpen] = useState<string | null>(null);

  // Chat dropdown
  const [optionsOpen, setOptionsOpen] = useState(false);

  // Message input
  // const [input, setInput] = useState('');

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {    
    setInput(chatId, e.currentTarget.value);
  }

  function handleSend() {
    if (chat.inputBuffer === '') return;
    addMessage(chatId, chat.inputBuffer);
    setInput(chatId, '');    
  }

  function handleClick(id: string): void {
    return open === id ? setOpen(null) : setOpen(id);
  }  


  // Close info panel every time chat changes
  useEffect(() => {
    closeInfo();
    setOpen(null);
    setOptionsOpen(false);
  }, [chat])
  

  return (
    <main className="flex flex-col bg-slate-200 h-screen w-full overflow-x-hidden">
      {/* Chat Header */}
      <div className="relative w-full bg-slate-300 pl-5 pr-8 h-20 flex items-center flex-shrink-0">
        {/* Avatar */}
        <div className="bg-slate-900 w-12 h-12 flex flex-shrink-0 items-center justify-center rounded-full select-none">
          <img className="w-[90%] rounded-full" src={chat.type === 'dm' ? avatar : creeper} alt="" />
        </div>

        {/* Name */}
        <div className="flex flex-col pl-3">
          {chat.type === "group" && (
            <>
              <h3 className="font-normal text-xl">{chat.name}</h3>
              <p className="font-normal text-sm">
                {chat.members.length} participants •{" "}
                {Math.floor(Math.random() * (chat.members.length + 1))} online
              </p>
            </>
          )}
          {chat.type === "dm" && (
            <>
              <h3 className="font-normal text-xl">{chat.contact.name}</h3>
              <p className="font-normal text-sm">Online</p>
            </>
          )}
        </div>

        {/* Ellipsis icon */}
        <div
          className={`
            ml-auto w-12 h-12 flex items-center bg-slate-300 justify-center rounded-xl cursor-pointer hover:brightness-90
            ${optionsOpen ? "brightness-90" : ""}
          `}
          onClick={() => setOptionsOpen((prev) => !prev)}
        >
          <FontAwesomeIcon
            className="text-slate-600"
            icon={faEllipsisV}
            size="xl"
          />
        </div>

        {/* Dropdown options menu */}
        <div className="absolute -right-6 top-24 select-none">
          <DropdownMenu
            chatType={chat.type}
            menuOpen={optionsOpen}
            infoData={chat.type === 'dm' ? chat.contact : chat}
            showInfo={chat.type === "dm" ? showUserInfo : showGroupInfo}
            setOptionsOpen={setOptionsOpen}
          />
        </div>
      </div>

      {/* Messages container */}
      <div className="flex flex-col px-4 pt-4 pb-4 w-full h-full overflow-y-auto">
        {messages.map((m) => (
          <Message
            key={m.id}
            id={m.id}
            sender={m.sender}
            content={m.content}
            open={open === m.id}
            setOpen={setOpen}
            handleClick={handleClick}
          />
        ))}
      </div>

      {/* Chat footer */}
      <div className="flex-shrink-0 min-h-[5rem] w-full px-10 py-4 bg-slate-300 flex flex-row items-end gap-4">
        {/* Text input */}
        <TextareaAutosize
          className="bg-slate-200 rounded-md py-3 px-4 flex-grow outline-none resize-none"
          placeholder="Type a message..."
          value={chat.inputBuffer}
          maxRows={10}
          onInput={handleInput}
        />
        {/* Send button */}
        <div
          className="group bg-slate-200 h-12 w-12 rounded-full relative cursor-pointer hover:bg-slate-400"
          onClick={handleSend}
        >
          <FontAwesomeIcon
            className="text-slate-500 absolute top-[14px] left-[12px] group-hover:text-slate-100"
            icon={faPaperPlane}
            size="lg"
          />
        </div>
      </div>
    </main>
  );
}

export default Chat