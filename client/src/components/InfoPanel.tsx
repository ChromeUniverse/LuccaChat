import React, { useEffect, useState } from "react";

// Components
import Group from "./Group";
import Contact from "./Contact";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faXmark,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

// Zustand store
import { useInfoStore } from "../zustand/info-panel-store";
import { GroupType, UserType } from "../data";
import { useChatsStore } from "../zustand/chats-store";
import { useUserStore } from "../zustand/user-store";
import { removeMemberSchema } from "../../../server/src/zod/schemas";
import { emitter } from "../routes/App";
import { z } from "zod";
import { useModalStore } from "../zustand/modals-store";
import { chatSchema } from "../../../server/src/zod/api-chats";
import fetchCommonGroups from "../api/fetchCommonGroups";
import { formatDate } from "../misc";

interface FooterMenuLineProps {
  text: string;
  icon: IconDefinition;
}

function FooterMenuLine({ text, icon }: FooterMenuLineProps) {
  const setModalState = useModalStore((state) => state.setModalState);

  return (
    <div
      className="pl-3 py-2 flex justify-start items-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md cursor-pointer"
      onClick={() => setModalState("kick-member")}
    >
      <FontAwesomeIcon className="w-6 text-red-500" icon={icon} size="lg" />
      <p className="font-semibold text-red-500 text-lg">{text}</p>
    </div>
  );
}

interface Props {
  type: "user" | "group";
  user?: UserType;
  group?: GroupType;
}

function InfoPanel({ type, user, group }: Props) {
  const userData = user as UserType;
  const groupData = group as GroupType;

  // Basic sanity checks
  if (type === "user" && !user) {
    throw new Error(
      `Info panel is of type "user" but received no user object!`
    );
  }
  if (type === "group" && !group) {
    throw new Error(
      `Info panel is of type "group" but received no group object!`
    );
  }

  // Common groups
  type chatType = z.infer<typeof chatSchema>;
  const [groups, setGroups] = useState<chatType[]>([]);

  // Closes the info panel
  const closeInfo = useInfoStore((state) => state.closeInfo);

  // get current chat data
  const getCurrentChat = useChatsStore((state) => state.getCurrentChat);
  const currentChat = getCurrentChat();
  const memberIds =
    currentChat.type === "group" ? currentChat.members.map((m) => m.id) : null;

  // Prevents user from accessing info panel about themselves
  const currentUser = useUserStore((state) => state.user);

  if (userData !== undefined && userData.id === currentUser.id) {
    throw new Error(
      "Currently auth'd user shouldn't be able to view info about themselves!!"
    );
  }

  // fetch common chats
  useEffect(() => {
    async function fetchData() {
      if (type !== "user") return;

      // Fetch common groups
      const { data, status } = await fetchCommonGroups(userData.id);
      if (!data) return console.log("Failed to fetch common chats");

      setGroups(data);
      console.log("got here!!!", data);
    }
    fetchData();
  }, []);

  // Event handler
  useEffect(() => {
    const memberKickedHandler = (data: z.infer<typeof removeMemberSchema>) => {
      // ignore if event's group ID doesn't match current Group ID
      if (data.groupId !== currentChat.id) return;
      console.log("member kicked handler fired!");
      if (type === "user" && userData.id === data.memberId) closeInfo();
    };

    emitter.on("memberKicked", memberKickedHandler);

    return () => {
      emitter.off("memberKicked", memberKickedHandler);
    };
  }, []);

  return (
    <div className="w-[380px] h-screen flex-shrink-0 bg-slate-100 dark:bg-slate-900 flex flex-col items-center">
      {/* Header */}
      <div className="flex-shrink-0 h-20 w-full bg-slate-300 dark:bg-slate-700 flex items-center gap-5 pl-6">
        <FontAwesomeIcon
          className="cursor-pointer flex-shrink-0 dark:text-slate-400"
          icon={faXmark}
          size="lg"
          onClick={closeInfo}
        />
        {type === "group" && <p className="text-xl">Group info</p>}
        {type === "user" && <p className="text-xl">User info</p>}
      </div>

      {/* Content */}
      <div className="w-full h-full pt-10 flex flex-col items-center gap-6 overflow-auto">
        {type === "group" && (
          <>
            {/* Group Avatar */}
            <img
              className="w-60 h-60 rounded-full object-cover shrink-0"
              src={`${import.meta.env.VITE_BACKEND_URL}/avatars/${
                groupData.id
              }.jpeg?${groupData.lastImageUpdate.getTime()}`}
              alt=""
            />

            {/* Group name, number of members, creation date */}
            <div className="flex flex-col gap-1 items-center">
              <p className="text-2xl font-semibold">{groupData.name}</p>
              <p className="text-md dark:text-slate-400">
                {groupData.isPublic ? "Public" : "Private"} group
              </p>
              <p className="text-sm text-center dark:text-slate-400">
                Created by {/* underline decoration-blue-400 decoration-2 */}
                <span className="font-bold dark:text-slate-200">
                  @{groupData.createdBy.handle}
                </span>{" "}
                on {formatDate(groupData.createdAt)}
              </p>
            </div>

            {/* Group description */}
            <div className="px-6 w-full pt-2 space-y-2">
              <p className="font-semibold dark:text-slate-400">Description</p>
              <p className="">{groupData.description}</p>
            </div>

            {/* List of members */}
            <div className="px-6 mb-8 w-full flex flex-col mt-2">
              {/* Section title */}
              <p className="font-semibold py-2 dark:text-slate-400">
                {groupData.members.length} members
              </p>

              {/* Group creator */}
              <Contact
                user={groupData.createdBy}
                highlight
                openInfoOnClick={groupData.createdBy.id !== currentUser.id}
              />

              {/* Other group members */}
              {groupData.members
                .filter((m) => m.id !== groupData.createdBy.id)
                .map((m) => (
                  <Contact
                    key={m.id}
                    user={m}
                    openInfoOnClick={m.id !== currentUser.id}
                    lastImageUpdate={groupData.lastImageUpdate}
                  />
                ))}
            </div>
          </>
        )}

        {type === "user" && (
          <>
            {/* User Avatar */}
            <img
              className="w-60 h-60 rounded-full object-cover shrink-0"
              src={`${import.meta.env.VITE_BACKEND_URL}/avatars/${
                userData.id
              }.jpeg?${Date.now()}`}
              alt=""
            />
            {/* User name/handle */}
            <div className="flex flex-col gap-1 items-center">
              <p className="text-2xl font-semibold">{userData.name}</p>
              <p className="text-md dark:text-slate-400">@{userData.handle}</p>
            </div>

            {/* Groups in common */}
            <div className="px-6 w-full flex flex-col mt-2 gap-1">
              <p className="font-semibold py-2 dark:text-slate-400">
                Groups in common
              </p>
              {groups.length > 0 ? (
                groups.map((g) => {
                  const getChatById = useChatsStore.getState().getChatById;
                  const { lastImageUpdate } = getChatById(g.id) as GroupType;
                  return (
                    <Group
                      key={g.id}
                      chatId={g.id}
                      name={g.name as string}
                      members={g._count.members}
                      lastImageUpdate={lastImageUpdate}
                    />
                  );
                })
              ) : (
                <p>No groups in common with this user.</p>
              )}
            </div>

            {/* Footer menu */}

            {/* 
              Only shows "Kick"/"Ban" buttons if current user:
              1. is viewing a "group" chat
              2. is the creator of the group
              3. is still a member of this group
            */}

            {currentChat.type === "group" &&
              currentChat.createdBy.id === currentUser.id &&
              memberIds?.includes(userData.id) && (
                <div className="mt-auto px-4 py-5 w-full flex flex-col gap-1">
                  <FooterMenuLine
                    text={`Kick ${userData.name}`}
                    icon={faXmark}
                  />
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}

export default InfoPanel;
