import React, { useState } from 'react'

// Components
import avatar from '../assets/avatar.jpeg'
import Contact from './Contact'

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faGear, faMagnifyingGlass, faPlus, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';
import Request from './Request';

// Zustand
import { useChatsStore } from '../zustand/chats-store';
import Group from './Group';

type Props = {}

function Sidebar({ }: Props) {
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [tab, setTab] = useState<'chats' | 'requests'>('chats');
  const [numRequests, setNumRequets] = useState(4);

  // Fetch chats from zustand store
  const chats = useChatsStore(state => state.chats);
  const chatId = useChatsStore(state => state.currentChatId); 
  const setChatId = useChatsStore(state => state.setCurrentChatId); 

  return (
    <section className="w-[350px] bg-slate-100 flex flex-col h-screen flex-shrink-0">
      {/* Sidebar Header */}
      <div className="flex-shrink-0 w-full bg-slate-300 px-5 h-20 flex items-center">
        {/* Avatar */}
        <div className="bg-slate-900 w-12 h-12 flex items-center justify-center rounded-full select-none">
          <img className="w-[90%] rounded-full" src={avatar} alt="" />
        </div>

        {/* Name */}
        <div className="flex flex-col pl-3">
          <h3 className="font-normal text-xl">Lucca Rodrigues</h3>
          <p className="font-bold text-sm">@lucca</p>
        </div>

        {/* Dropdown menu container */}
        <div
          className="ml-auto cursor-pointer"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {/* Gear FA icon */}
          <FontAwesomeIcon
            className={`text-slate-600 transition-all ${
              menuOpen ? "rotate-0" : "rotate-180"
            }`}
            icon={faGear}
            size="xl"
          />
        </div>
      </div>

      {/* Main Sidebar content */}
      <div className="flex flex-col px-2 w-full h-full overflow-hidden relative">
        {/* Dropdown menu */}

        {/* // dark translucent BG wrapper */}
        <div
          className={`
            absolute top-0 left-0 bg-black bg-opacity-50 w-full h-full flex flex-col items-center transition-all select-none
            ${menuOpen ? "z-10" : "-z-10 bg-transparent"}
          `}
        >
          <div
            className={`px-8 py-6 w-[85%] bg-slate-300 rounded-md flex flex-col gap-4 transition-all
            ${menuOpen ? "mt-2" : "-mt-4"}
          `}
          >
            {/* Account */}
            <div className="flex justify-between items-center">
              <p className="font-semibold text-xl">Account</p>
              <FontAwesomeIcon
                className="cursor-pointer"
                icon={faUser}
                size="lg"
              />
            </div>

            {/* Divider */}
            <hr className="bg-black border-none w-full h-[0.1rem] rounded-full" />

            {/* Dark mode toggle */}
            <div className="flex justify-between items-center">
              <p className="font-semibold text-xl">Dark mode</p>
              {/* Toggle */}
              <div
                className="h-8 w-16 bg-slate-400 rounded-full relative cursor-pointer"
                onClick={() => setToggle((prev) => !prev)}
              >
                {/* Slider */}
                <div
                  className={`
                    h-6 w-6 bg-slate-200 rounded-full absolute top-1 transition-all
                    ${toggle ? "left-9" : "left-1"}                    
                  `}
                ></div>
              </div>
            </div>

            {/* Divider */}
            <hr className="bg-black border-none w-full h-[0.1rem] rounded-full" />

            {/* Accent color selector */}
            <div className="flex flex-col justify-between gap-3">
              <p className="font-semibold text-xl">Accent color</p>
              {/* Color selectors container */}
              <div className="flex justify-between">
                <div className="h-10 w-10 rounded-full cursor-pointer hover:brightness-90 bg-blue-400"></div>
                <div className="h-10 w-10 rounded-full cursor-pointer hover:brightness-90 bg-pink-400"></div>
                <div className="h-10 w-10 rounded-full cursor-pointer hover:brightness-90 bg-green-400"></div>
                <div className="h-10 w-10 rounded-full cursor-pointer hover:brightness-90 bg-orange-400"></div>
                <div className="h-10 w-10 rounded-full cursor-pointer hover:brightness-90 bg-violet-400"></div>
              </div>
            </div>

            {/* Divider */}
            <hr className="bg-black border-none w-full h-[0.1rem] rounded-full" />

            {/* Log out */}
            <div className="flex justify-between items-center">
              <p className="font-semibold text-xl">Log out</p>
              <FontAwesomeIcon
                className="cursor-pointer"
                icon={faArrowRightFromBracket}
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mt-2 py-1.5 bg-slate-300 flex rounded-md select-none">
          {/* "Chats" text */}
          <p
            className="flex-1 text-center cursor-pointer font-semibold"
            onClick={() => setTab("chats")}
          >
            Chats
          </p>

          {/* "Requests" container */}
          <div
            className="flex-1 flex gap-3 items-center justify-center cursor-pointer"
            onClick={() => setTab("requests")}
          >
            {/* Text */}
            <p className="font-semibold">Requests</p>
            {/* Badge */}
            {numRequests !== 0 && (
              <div className="bg-slate-400 w-6 h-6 rounded-full flex items-center justify-center">
                <p className="font-bold text-sm text-white">{numRequests}</p>
              </div>
            )}
          </div>

          <div
            className={`
              absolute top-8 w-[50%] h-1 bg-black rounded-full transition-all
              ${tab === "chats" ? "left-0" : "left-[50%]"}
            `}
          ></div>
        </div>

        {/* Chats Tab */}
        {tab === "chats" && (
          <>
            {/* Chats search bar */}
            <div className="w-full px-4 mt-2.5 bg-slate-200 rounded-md flex items-center gap-3">
              <FontAwesomeIcon
                className="text-slate-500"
                icon={faMagnifyingGlass}
              />
              <input
                className="w-full py-3 bg-transparent outline-none"
                placeholder="Search chats"
                type="text"
              />
            </div>

            {/* Chatss container */}
            <div className="flex flex-col mt-3 gap-1 overflow-y-auto">
              {chats.map((chat) => {                                
                return chat.type === "dm" ? (
                  <Contact
                    key={chat.id}
                    name={chat.contact.name}
                    handle={chat.contact.handle}
                    chatId={chat.id}
                  />
                ) : (
                  <Group
                    key={chat.id}
                    name={chat.name}
                    members={chat.members.length}
                    chatId={chat.id}
                  />
                );
              })}


              {/* Add chat button */}
              <div
                className="group px-3 py-2 w-full flex items-center gap-3 hover:bg-slate-400 hover:bg-opacity-20 rounded-lg cursor-pointer"              
              >
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-slate-300 group-hover:bg-slate-400 flex items-center justify-center">
                  <FontAwesomeIcon className='text-slate-600 group-hover:text-slate-200' icon={faPlus} size="lg"/>
                </div>

                {/* Group Name */}
                <div className="flex flex-col">
                  <h3 className="font-normal text-xl">Add chat</h3>
                </div>
              </div>
  
            </div>
          </>
        )}

        {/* Requests tab */}
        {tab === "requests" && (
          // Requests container
          <div className="mt-4 px-2 w-full flex flex-col gap-4">
            <Request name="Lucca Rodrigues" />
            <Request name="Lucca Rodrigues" />
            <Request name="Lucca Rodrigues" />
          </div>
        )}
      </div>

      {/* Sidebar Foooter */}
      <div className="flex-shrink-0 mt-auto h-20 bg-slate-300 flex items-center justify-center gap-2">
        <div className="flex justify-center gap-2">
          <p className="font-semibold text-2xl">LuccaChat</p>
          <FontAwesomeIcon
            className="mt-[3px]"
            icon={faCommentDots}
            size="xl"
          />
        </div>
      </div>
    </section>
  );
}

export default Sidebar