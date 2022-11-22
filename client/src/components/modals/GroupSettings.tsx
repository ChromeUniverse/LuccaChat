import React, { useEffect, useState } from "react";
import creeper from "../../assets/creeper.webp";

// Font Awesome
import {
  faAngleRight,
  faArrowLeft,
  faRotateRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Zustand
import { useModalStore } from "../../zustand/modals-store";
import { useChatsStore } from "../../zustand/chats-store";
import { nanoid } from "nanoid";
import { faClipboard } from "@fortawesome/free-regular-svg-icons";
import { GroupType } from "../../data";
import { useDebouncedCallback } from "use-debounce";
import { emitter } from "../../App";
import useWebSockets from "../../hooks/useWebSockets";

type Props = {};

function GroupSettings({}: Props) {
  const setModalState = useModalStore((state) => state.setModalState);
  const getCurrentChat = useChatsStore((state) => state.getCurrentChat);
  const group = getCurrentChat() as GroupType;
  const { sendUpdateGroup, sendRegenInvite } = useWebSockets();

  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [isPublic, setIsPublic] = useState(group.isPublic);
  const [prompt, setPrompt] = useState("");
  const [updatePrompt, setUpdatePrompt] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    setDescription(e.currentTarget.value);
  }

  const debouncedClearPrompt = useDebouncedCallback(() => setPrompt(""), 1000);
  const debouncedClearUpdatePrompt = useDebouncedCallback(
    () => setUpdatePrompt(""),
    1000
  );

  function handleInviteClick(type: "copy" | "reset") {
    if (type === "copy") {
      setPrompt("Copied!");
      debouncedClearPrompt();
    } else {
      sendRegenInvite(group.id);
    }
  }

  // button click handler
  function handleUpdate() {
    sendUpdateGroup(group.id, name, description, isPublic);
  }

  useEffect(() => {
    const groupUpdateHandler = (groupId: string) => {
      // ignore event if the event's group ID doesn't match this group's ID
      if (groupId !== group.id) return;
      console.log("update group fired!!!");
      setUpdatePrompt("Updated!");
      debouncedClearUpdatePrompt();
    };

    const inviteUpdateHandler = (groupId: string) => {
      // ignore event if the event's group ID doesn't match this group's ID
      if (groupId !== group.id) return;
      console.log("update invite code fired!!!");
      setPrompt("Invite reset!");
      debouncedClearPrompt();
    };

    emitter.on("groupUpdated", groupUpdateHandler);
    emitter.on("inviteSet", inviteUpdateHandler);

    return () => {
      emitter.off("groupUpdated", groupUpdateHandler);
      emitter.off("inviteSet", inviteUpdateHandler);
    };
  }, []);

  return (
    <div className="px-16 pt-6 pb-12 bg-slate-300 bg-opacity-100 z-20 rounded-xl flex flex-col">
      {/* Modal header */}
      <div className="flex flex-row w-full items-center">
        <h2 className="py-3 text-2xl font-semibold mr-auto">Group Settings</h2>
        <FontAwesomeIcon
          className="cursor-pointer"
          icon={faXmark}
          size="lg"
          onClick={() => setModalState(null)}
        />
      </div>

      {/* Modal content */}
      <div className="flex mt-4 gap-10">
        {/* Upload picture */}
        <div className="flex flex-col w-60 justify-center">
          {/* Group picture */}
          <img className="rounded-full w-full" src={creeper} alt="" />

          {/* Upload button */}
          <button className="bg-slate-400 hover:bg-opacity-50 mt-6 w-full rounded-full font-semibold text-slate-100 text-lg py-2 outline-none">
            Upload photo
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col w-96">
          {/* Name input */}
          <p className="pb-2">Name</p>
          <input
            className="w-full py-3 mb-5 px-5 bg-slate-200 rounded-xl outline-none"
            placeholder="My awesome group"
            value={name}
            onChange={handleChange}
            type="text"
          />

          {/* Description input */}
          <p className="pb-2">Description</p>
          <textarea
            className="w-full py-3 mb-5 px-5 bg-slate-200 rounded-xl outline-none resize-none"
            placeholder="Simply the best group chat ever created. Change my mind"
            onInput={handleInput}
            value={description}
            rows={3}
          ></textarea>

          {/* Public/Private toggle */}
          <div className="flex justify-between items-center">
            {/* Label */}
            <p>Make this group public</p>

            {/* Dark mode toggle */}
            <div className="flex justify-between items-center">
              {/* Toggle */}
              <div
                className={`
                  h-8 w-16 rounded-full relative cursor-pointer transition-all
                  ${isPublic ? "bg-sky-700" : "bg-slate-400"}
                `}
                onClick={() => setIsPublic((prev) => !prev)}
              >
                {/* Slider */}
                <div
                  className={`
                    h-6 w-6 rounded-full bg-slate-200 absolute top-1 transition-all
                    ${isPublic ? "left-9" : "left-1"}
                  `}
                ></div>
              </div>
            </div>
          </div>

          {/* Extra info (Public/Private toggle) */}
          {!isPublic && (
            <p className="italic text-sm mt-3 text-slate-600 select-none">
              New members need an invite link to join a private group.
            </p>
          )}

          {/* Invite link */}
          <div className="mt-6">
            <div className="flex gap-4 mb-2">
              <p className="flex-shrink-0 mr-auto">Invite Link</p>
              {prompt && <p className="text-slate-600 select-none">{prompt}</p>}
              <FontAwesomeIcon
                className="text-slate-700 hover:text-slate-500 cursor-pointer"
                size="lg"
                icon={faClipboard}
                onClick={() => handleInviteClick("copy")}
              />
              <FontAwesomeIcon
                className="text-slate-700 hover:text-slate-500 cursor-pointer"
                size="lg"
                icon={faRotateRight}
                onClick={() => handleInviteClick("reset")}
              />
            </div>
            <div className="flex items-center gap-3 w-full py-3 px-0 bg-slate-200 rounded-xl outline-none select-none">
              <p className="text-slate-600 w-full text-center mr-auto text-[15px]">
                luccachat.app/invite/{group.inviteCode}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal footer */}
      <div className="flex w-full pt-6 items-center gap-6">
        {/* Update Prompt */}
        <p className="ml-auto">{updatePrompt}</p>

        {/* Update Button */}
        <div
          className="bg-slate-400 px-6 h-14 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center hover:bg-opacity-50"
          onClick={handleUpdate}
        >
          <p className="font-semibold text-slate-200 text-lg mr-3">Update</p>
          <FontAwesomeIcon
            className="text-slate-200"
            icon={faAngleRight}
            size="lg"
          />
        </div>
      </div>
    </div>
  );
}

export default GroupSettings;
