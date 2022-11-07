import React, { useContext } from 'react'

// Dummy pictures
import avatar from "../assets/avatar.jpeg";
import creeper from "../assets/creeper.webp";

// Components
import Group from './Group';
import Contact from './Contact';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faXmark, IconDefinition } from '@fortawesome/free-solid-svg-icons'

// Zustand store
import { useInfoStore } from '../zustand/info-panel-store';
import { GroupType, UserType } from '../data';
import { AuthContext } from '../App';
import { useChatsStore } from '../zustand/chats-store';

function FooterMenuLine({text, icon}: {text:string, icon: IconDefinition}) {
  return (
    <div className="pl-3 py-2 flex justify-start items-center gap-3 hover:bg-slate-200 rounded-md cursor-pointer">
      <FontAwesomeIcon className="w-6 text-red-500" icon={icon} size="lg" />
      <p className="font-semibold text-red-500 text-lg">{text}</p>
    </div>
  );
}

// helper function
function formatDate(date: Date) {
  return date.toLocaleDateString('default', {month: 'short', day: 'numeric', year: 'numeric'});
}


interface Props {
  type: 'user' | 'group';
  user?: UserType,
  group?: GroupType,
}

function InfoPanel({ type, user, group }: Props) {

  const userData = user as UserType;
  const groupData = group as GroupType;

  if (type === 'user' && !user) throw new Error(`Info panel is of type "user" but received no user object!`);
  if (type === 'group' && !group) throw new Error(`Info panel is of type "group" but received no group object!`);
  
  const closeInfo = useInfoStore(state => state.closeInfo);

  // get current chat data
  const getCurrentChat = useChatsStore(state => state.getCurrentChat);
  const currentChat = getCurrentChat();

  // Prevents user from accessing info panel about themselves
  const currentUser = useContext(AuthContext);
  if (userData !== undefined && userData.id === currentUser.id) throw new Error("Currently auth'd user shouldn't be able to view info about themselves!!");

  return (
    <div className="w-[330px] h-screen flex-shrink-0 bg-slate-100 flex flex-col items-center">
      {/* Header */}
      <div className="flex-shrink-0 h-20 w-full bg-slate-300 flex items-center gap-4 pl-5">
        <FontAwesomeIcon
          className="cursor-pointer flex-shrink-0"
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
            <img className="w-60 rounded-full" src={creeper} alt="" />

            {/* Group name, number of members */}
            <div className="flex flex-col gap-1 items-center">
              <p className="text-2xl font-semibold">{groupData.name}</p>
              {/* <p className="text-md">{groupData.members.length} members</p> */}
              <p className="text-sm text-center">
                Created by{" "}
                <span className="font-bold">@{groupData.createdBy.handle}</span>{" "}
                on {formatDate(groupData.createdAt)}
              </p>
            </div>

            {/* Group description */}
            <div className="px-4 w-full pt-2">
              <p className="font-semibold">Description</p>
              <p>{groupData.description}</p>
            </div>

            {/* List of members */}
            <div className="px-4 mb-8 w-full flex flex-col mt-2">
              <p className="font-semibold py-2">
                {groupData.members.length} members
              </p>
              {groupData.members.map((m) => (
                <Contact name={m.name} handle={m.handle} />
              ))}
            </div>
          </>
        )}

        {type === "user" && (
          <>
            {/* User Avatar */}
            <img className="w-60 rounded-full" src={avatar} alt="" />
            {/* User name/handle */}
            <div className="flex flex-col gap-1 items-center">
              <p className="text-2xl font-semibold">{userData.name}</p>
              <p className="text-md">@{userData.handle}</p>
            </div>

            {/* Groups in common */}
            <div className="px-4 w-full flex flex-col mt-2">
              <p className="font-semibold py-2">Groups in common</p>
              <Group name="Awesome Group 1" members={1162} />
              <Group name="Awesome Group 1" members={99} />
              <Group name="Awesome Group 1" members={99} />
            </div>

            {/* Footer menu */}

            {/* 
              Only shows "Kick"/"Ban" buttons if current user:
              1. is viewing a "group" chat
              2. is the creator of the group
            */}

            {currentChat.type === "group" &&
              currentChat.createdBy.id === currentUser.id && (
                <div className="mt-auto px-4 py-5 w-full flex flex-col gap-1">
                  <FooterMenuLine
                    text={`Kick ${userData.name}`}
                    icon={faXmark}
                  />
                  <FooterMenuLine text={`Ban ${userData.name}`} icon={faBan} />
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}

export default InfoPanel