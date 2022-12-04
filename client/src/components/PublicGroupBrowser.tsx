import React, { useEffect, useState } from "react";
import create from "zustand";

// Test photo
import fetchPublicGroups from "../api/fetchPublicGroups";
import { chatSchema } from "../../../server/src/zod/api-chats";
import { z } from "zod";
import { useModalStore } from "../zustand/modals-store";
import useWebSockets from "../hooks/useWebSockets";
import { emitter } from "../routes/App";
import { joinGroupAckSchema } from "../../../server/src/zod/schemas";
import { useDebouncedCallback } from "use-debounce";
import { usePreferenceStore } from "../zustand/userPreferences";

type chatType = z.infer<typeof chatSchema>;

interface State {
  open: boolean;
  setOpen: (newOpen: boolean) => void;
}

export const useBrowserStore = create<State>((set) => ({
  open: false,
  setOpen: (newOpen) => set((state) => ({ ...state, open: newOpen })),
}));

interface GroupCardProps {
  group: chatType;
  setErrorPrompt: (errorPrompt: string) => void;
}

// helper function
function formatDate(date: Date) {
  return date.toLocaleDateString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function GroupCard({ group, setErrorPrompt }: GroupCardProps) {
  const { sendJoinGroup } = useWebSockets();
  const accentColor = usePreferenceStore((state) => state.accentColor);

  function handleClick() {
    sendJoinGroup(group.id);
  }

  const debouncedClearErrorPrompt = useDebouncedCallback(
    () => setErrorPrompt(""),
    2000
  );

  useEffect(() => {
    type data = z.infer<typeof joinGroupAckSchema>;
    const handler = ({ error, msg }: data) => {
      if (error && msg) {
        setErrorPrompt(msg);
        debouncedClearErrorPrompt();
        return;
      }
    };

    emitter.on("gotJoinGroupAck", handler);

    return () => {
      emitter.off("gotJoinGroupAck", handler);
    };
  }, []);

  return (
    <div className="flex bg-slate-300 dark:bg-slate-700 rounded-lg pl-6 pr-6 py-6 gap-5">
      {/* Group photo */}
      <div className="flex flex-col items-center justify-center gap-4">
        <img
          className="rounded-full w-24 h-24"
          src={`${import.meta.env.VITE_BACKEND_URL}/avatars/${
            group.id
          }.jpeg?${Date.now()}`}
          alt=""
        />

        {/* Card footer / Join button */}
        <button
          className={`bg-${accentColor}-500 hover:bg-${accentColor}-400 text-slate-100 text-lg px-5 py-0.5 font-semibold rounded-full outline-none`}
          onClick={handleClick}
        >
          Join
        </button>
      </div>

      {/* Card content */}
      <div className="flex flex-col flex-1">
        {/* Group Name */}
        <h3 className="text-2xl font-semibold">{group.name}</h3>
        {/* Creator Information */}
        <p className="mt-1 text-sm dark:text-slate-400">
          Created by{" "}
          <span className="font-semibold dark:text-slate-100">
            @{group.creator?.handle}
          </span>{" "}
          on {formatDate(group.createdAt)}
        </p>
        {/* Group Description */}
        <p className="mt-2 text-slate-200">{group.description}</p>
      </div>
    </div>
  );
}

function PublicGroupBrowser() {
  const setOpen = useBrowserStore((state) => state.setOpen);

  const [groups, setGroups] = useState<chatType[]>([]);
  const [errorPrompt, setErrorPrompt] = useState("");

  // fetch public groups
  useEffect(() => {
    async function main() {
      const { data, status } = await fetchPublicGroups();
      if (!data) return console.error("Failed to fetch public groups");
      setGroups(data);
    }
    main();
  }, []);

  const modalState = useModalStore((state) => state.modalState);

  // Escape key click handler
  useEffect(() => {
    const handleEscPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        console.log(modalState);
        // TODO: FIX ISSUE WITH BROWSER CLOSING WHEN MODAL IS OPEN
        if (modalState !== null) return console.log("Got here");
        return setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscPress);

    return () => {
      window.removeEventListener("keydown", handleEscPress);
    };
  }, []);

  return (
    <div className="bg-slate-200 dark:bg-slate-800 w-full pt-8 px-12 flex flex-col relative">
      {/* Page title */}
      <h1 className="text-2xl font-semibold">Browse public groups</h1>

      {/* Group card container */}
      <div className="grid grid-cols-2 gap-4 mt-6 pb-6 px-1 overflow-y-auto">
        {groups.map((g) => (
          <GroupCard key={g.id} group={g} setErrorPrompt={setErrorPrompt} />
        ))}
      </div>

      {/* Error popup */}
      {errorPrompt && (
        <div className="absolute bottom-10 left-0 w-full flex justify-center">
          <p className="bg-slate-300 dark:bg-slate-700 text-xl px-10 py-3 rounded-full text-red-500 font-semibold">
            {errorPrompt}
          </p>
        </div>
      )}
    </div>
  );
}

export default PublicGroupBrowser;
