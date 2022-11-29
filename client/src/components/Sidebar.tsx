import React, { useState } from "react";

// Components
import avatar from "../assets/avatar.jpeg";
import Contact from "./Contact";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faGear,
  faMagnifyingGlass,
  faPlus,
  faRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faCommentDots } from "@fortawesome/free-regular-svg-icons";
import { RequestType } from "../data";

// Zustand
import { useChatsStore } from "../zustand/chats-store";
import Group from "./Group";
import { useModalStore } from "../zustand/modals-store";
import { useRequestsStore } from "../zustand/requests-store";
import Request from "./Request";
import { useUserStore } from "../zustand/user-store";

const Divider = () => {
  return <hr className="bg-black border-none w-full h-[0.1rem] rounded-full" />;
};

type Props = {};

function Sidebar({}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [tab, setTab] = useState<"chats" | "requests">("chats");

  // Fetch current user
  const currentUser = useUserStore((state) => state.user);
  const lastImageUpdate = useUserStore((state) => state.lastImageUpdate);

  // Fetch chats, sort by latest first
  const chats = useChatsStore((state) => state.chats);
  const sortedChats = chats.sort(
    (c1, c2) => c2.latest.getTime() - c1.latest.getTime()
  );

  // Fetch requests
  const requests = useRequestsStore((state) => state.requests);
  const sortedRequests = requests.sort(
    (r1, r2) => r2.sentAt.getTime() - r1.sentAt.getTime()
  );

  // Modal controls
  const setModalState = useModalStore((state) => state.setModalState);

  return (
    <section className="w-[350px] bg-slate-100 flex flex-col h-screen flex-shrink-0">
      {/* Sidebar Header */}
      <div className="flex-shrink-0 w-full bg-slate-300 px-5 h-20 flex items-center">
        {/* Avatar */}
        <div className="w-12 h-12 flex items-center justify-center rounded-full select-none">
          <img
            className="w-12 h-12 rounded-full object-cover"
            key={Date.now()}
            src={`${import.meta.env.VITE_BACKEND_URL}/avatars/${
              currentUser.id
            }.jpeg?${lastImageUpdate.getTime()}`}
            alt=""
          />
        </div>

        {/* Name */}
        <div className="flex flex-col pl-3">
          <h3 className="font-normal text-xl">{currentUser.name}</h3>
          <p className="font-bold text-sm">@{currentUser.handle}</p>
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
        {/* dark translucent BG wrapper */}
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
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setModalState("account-settings")}
            >
              <p className="font-semibold text-xl">Account</p>
              <FontAwesomeIcon
                className="cursor-pointer"
                icon={faUser}
                size="lg"
              />
            </div>

            {/* Divider */}
            <Divider />

            {/* Dark mode toggle */}
            <div className="flex justify-between items-center">
              <p className="font-semibold text-xl">Dark mode</p>
              {/* Toggle */}
              <div
                className={`
                  h-8 w-16 rounded-full relative cursor-pointer transition-all
                  ${toggle ? "bg-blue-400" : "bg-slate-400"}
                `}
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
            <Divider />

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
            <Divider />

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
            className="flex-1 text-center cursor-pointer font-semibold text-slate-600"
            onClick={() => setTab("chats")}
          >
            Chats
          </p>

          {/* "Requests" container */}
          <div
            className="flex-1 flex gap-3 items-center justify-center cursor-pointer text-slate-600"
            onClick={() => setTab("requests")}
          >
            {/* Text */}
            <p className="font-semibold">Requests</p>
            {/* Badge */}
            {requests.length !== 0 && (
              <div className="bg-slate-400 w-6 h-6 rounded-full flex items-center justify-center">
                <p className="font-bold text-sm text-white">
                  {requests.length}
                </p>
              </div>
            )}
          </div>

          <div
            className={`
              absolute top-8 w-[50%] h-1 bg-slate-600 rounded-full transition-all
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

            {/* Chats container */}
            <div className="flex flex-col mt-3 mb-3 gap-1 overflow-y-auto">
              {sortedChats.map((chat) => {
                return chat.type === "dm" ? (
                  <Contact
                    key={chat.id}
                    user={chat.contact}
                    chatId={chat.id}
                    lastImageUpdate={chat.lastImageUpdate}
                  />
                ) : (
                  <Group
                    key={chat.id}
                    name={chat.name}
                    members={chat.members.length}
                    chatId={chat.id}
                    lastImageUpdate={chat.lastImageUpdate}
                  />
                );
              })}

              {/* Add chat button */}
              <div
                className="group px-3 py-2 w-full flex items-center gap-3 hover:bg-slate-200 rounded-lg cursor-pointer"
                onClick={() => setModalState("add-chat")}
              >
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-slate-300 group-hover:bg-slate-400 flex items-center justify-center">
                  <FontAwesomeIcon
                    className="text-slate-600 group-hover:text-slate-200"
                    icon={faPlus}
                    size="lg"
                  />
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
          <div className="mt-4 mb-3 px-2 w-full flex flex-col gap-4">
            {sortedRequests.map((r) => (
              <Request key={r.id} request={r} />
            ))}
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

export default Sidebar;
