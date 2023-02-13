import React, { useMemo, useState } from "react";

// Components
import Contact from "./Contact";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faCheck,
  faGear,
  faMagnifyingGlass,
  faPlus,
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
import { usePreferenceStore } from "../zustand/userPreferences";
import { colorType } from "../data";

const Divider = () => {
  return (
    <hr className="bg-black dark:bg-slate-600 border-none w-full h-[0.1rem] rounded-full" />
  );
};

type Props = {};

function Sidebar({}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<"chats" | "requests">("chats");

  // Fetch current user
  const currentUser = useUserStore((state) => state.user);
  const lastImageUpdate = useUserStore((state) => state.lastImageUpdate);

  // get user preferences
  const darkMode = usePreferenceStore((state) => state.darkMode);
  const toggleDarkMode = usePreferenceStore((state) => state.toggleDarkMode);
  const accentColor = usePreferenceStore((state) => state.accentColor);

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

  // Search bar input
  const [searchInput, setSearchInput] = useState("");

  // Using memoized derived state to filter and sort chats
  const processedChats = useMemo(() => {
    if (!searchInput) return sortedChats;

    return (
      sortedChats
        // filter by search input string
        .filter((chat) =>
          chat.type === "dm"
            ? chat.contact.handle
                .toLowerCase()
                .includes(searchInput.toLowerCase()) ||
              chat.contact.name
                .toLowerCase()
                .includes(searchInput.toLowerCase())
            : chat.name.toLowerCase().includes(searchInput.toLowerCase())
        )
    );
  }, [chats, searchInput]);

  // Logout the user
  function handleLogoutClick() {
    console.log("Clicked!");
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/logout`;
  }

  return (
    <section className="w-[370px] bg-slate-100 dark:bg-slate-900 flex flex-col h-screen flex-shrink-0">
      {/* Sidebar Header */}
      <div className="flex-shrink-0 w-full bg-slate-300 dark:bg-slate-700 px-5 h-20 flex items-center">
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
          <p className="font-normal text-sm text-slate-500 dark:text-slate-400">
            @{currentUser.handle}
          </p>
        </div>

        {/* Dropdown menu button */}
        <div
          className="ml-auto cursor-pointer"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {/* Gear FA icon */}
          <FontAwesomeIcon
            className={`text-slate-600 dark:text-slate-400 transition-all ${
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
            className={`px-8 py-6 w-[85%] bg-slate-300 dark:bg-slate-700 dark:text-slate-200 rounded-md flex flex-col gap-4 transition-[margin-top]
            ${menuOpen ? "mt-2" : "-mt-4"}
          `}
          >
            {/* Account */}
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setModalState("account-settings")}
            >
              <p className="font-semibold text-xl transition-none">Account</p>
              <FontAwesomeIcon
                className="transition-none"
                icon={faUser}
                size="lg"
              />
            </div>

            {/* Divider */}
            <Divider />

            {/* Dark mode toggle */}
            <div className="flex justify-between items-center">
              <p className="font-semibold text-xl transition-none">Dark mode</p>
              {/* Toggle */}
              <div
                className={`
                  h-8 w-16 rounded-full relative cursor-pointer
                  ${darkMode ? `bg-${accentColor}-500` : "bg-slate-400"}
                `}
                onClick={() => toggleDarkMode()}
              >
                {/* Slider */}
                <div
                  className={`
                    h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full absolute top-1 transition-all
                    ${darkMode ? "left-9" : "left-1"}                    
                  `}
                ></div>
              </div>
            </div>

            {/* Divider */}
            <Divider />

            {/* Log out */}
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={handleLogoutClick}
            >
              <p className="font-semibold text-xl transition-none">Log out</p>
              <FontAwesomeIcon
                className="transition-none"
                icon={faArrowRightFromBracket}
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mt-2 py-1.5 bg-slate-300 dark:bg-slate-700 flex rounded-md select-none">
          {/* "Chats" text */}
          <p
            className="flex-1 text-center cursor-pointer font-semibold text-slate-600 dark:text-slate-200"
            onClick={() => setTab("chats")}
          >
            Chats
          </p>

          {/* "Requests" container */}
          <div
            className="flex-1 flex gap-2 items-center justify-center cursor-pointer text-slate-600 dark:text-slate-200"
            onClick={() => setTab("requests")}
          >
            {/* Text */}
            <p className="font-semibold">Requests</p>
            {/* Badge */}
            {requests.length !== 0 && (
              <div
                className={`bg-${accentColor}-500 px-2 min-w-[1.5rem] h-6 rounded-full flex items-center justify-center`}
              >
                <p className="font-bold text-sm text-white dark:text-slate-100">
                  {requests.length}
                </p>
              </div>
            )}
          </div>

          {/* Tabs Slider */}
          <div
            className={`
              absolute top-[34px] w-[50%] h-[3px] bg-${accentColor}-500 rounded-full transition-all
              ${tab === "chats" ? "left-0" : "left-[50%]"}
            `}
          ></div>
        </div>

        {/* Chats Tab */}
        {tab === "chats" && (
          <>
            {/* Chats search bar */}
            <div className="w-full px-4 mt-2.5 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center gap-3">
              <FontAwesomeIcon
                className={`text-${accentColor}-500`}
                icon={faMagnifyingGlass}
              />
              <input
                className="w-full py-3 bg-transparent outline-none dark:text-slate-200"
                placeholder="Search chats"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Chats container */}
            <div className="flex flex-col mt-3 mb-3 gap-1 overflow-y-auto">
              {processedChats.map((chat) => {
                return chat.type === "dm" ? (
                  <Contact
                    key={chat.id}
                    user={chat.contact}
                    chatId={chat.id}
                    lastImageUpdate={chat.lastImageUpdate}
                    // highlight
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
                className="group px-3 py-2 w-full flex items-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                onClick={() => setModalState("add-chat")}
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-full bg-${accentColor}-500 group-hover:bg-${accentColor}-400 flex items-center justify-center`}
                >
                  <FontAwesomeIcon
                    className="text-white "
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
      <div className="flex-shrink-0 mt-auto h-20 bg-slate-300 dark:bg-slate-700 flex items-center justify-center gap-2">
        <div className="flex justify-center gap-2">
          <p className={`font-semibold text-2xl text-${accentColor}-500`}>
            LuccaChat
          </p>
          <FontAwesomeIcon
            className={`mt-[3px] text-${accentColor}-500`}
            icon={faCommentDots}
            size="xl"
          />
        </div>
      </div>
    </section>
  );
}

export default Sidebar;
