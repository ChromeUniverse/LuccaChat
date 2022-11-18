import React, { useEffect } from "react";
import create from "zustand";

// Test photo
import creeper from "../assets/creeper.webp";
import avatar from "../assets/avatar.jpeg";
import { sampleChat1, useChatsStore } from "../zustand/chats-store";
import { GroupType } from "../data";

interface State {
  open: boolean;
  setOpen: (newOpen: boolean) => void;
}

const chat = sampleChat1;

export const useBrowserStore = create<State>((set) => ({
  open: false,
  setOpen: (newOpen) => set((state) => ({ ...state, open: newOpen })),
}));

interface GroupCardProps {
  group: GroupType;
}

// helper function
function formatDate(date: Date) {
  return date.toLocaleDateString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function GroupCard({ group }: GroupCardProps) {
  return (
    <div className="flex bg-slate-300 rounded-lg pl-6 pr-6 py-6 gap-5">
      {/* Group photo */}
      <div className="flex flex-col items-center justify-center gap-2">
        <img className="rounded-full w-24 h-24" src={creeper} alt="" />

        <button className="bg-slate-400 text-slate-100 text-lg px-4 py-0.5 font-semibold rounded-full outline-none hover:bg-opacity-50">
          Join
        </button>
      </div>

      {/* Card content */}
      <div className="flex flex-col flex-1 justify-center">
        {/* Group Name */}
        <h3 className="text-2xl font-semibold">{group.name}</h3>
        {/* Creator Information */}
        <p className="text-sm">
          Created by{" "}
          <span className="font-semibold">@{group.createdBy.handle}</span> on{" "}
          {formatDate(group.createdAt)}
        </p>
        {/* Group Description */}
        <p className="mt-2">{group.description}</p>
        {/* Card footer / Join button */}
      </div>
    </div>
  );
}

function PublicGroupBrowser() {
  const setOpen = useBrowserStore((state) => state.setOpen);
  const chats = useChatsStore((state) => state.chats);

  // Escape key click handler
  useEffect(() => {
    const handleEscPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        return setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscPress);

    return () => {
      window.removeEventListener("keydown", handleEscPress);
    };
  }, []);

  return (
    <div className="bg-slate-200 w-full pt-8 px-12 flex flex-col">
      {/* Page title */}
      <h1 className="text-2xl font-semibold">Browse public groups</h1>

      {/* Group card container */}
      <div className="grid grid-cols-2 gap-4 mt-6 pb-6 px-1 overflow-y-auto">
        {chats.map(
          (chat) =>
            chat.type === "group" && chat.isPublic && <GroupCard group={chat} />
        )}
        {/* <GroupCard group={chat} />
        <GroupCard group={chat} />
        <GroupCard group={chat} />
        <GroupCard group={chat} />
        <GroupCard group={chat} />
        <GroupCard group={chat} /> */}
      </div>
    </div>
  );
}

export default PublicGroupBrowser;
