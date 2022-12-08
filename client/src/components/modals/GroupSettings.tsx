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
import { emitter } from "../../routes/App";
import useWebSockets from "../../hooks/useWebSockets";
import { copyInviteLinkToClipboard } from "../../misc";
import { errorGroupInfoSchema } from "../../../../server/src/zod/schemas";
import { z } from "zod";
import { usePreferenceStore } from "../../zustand/userPreferences";

function GroupSettings() {
  const accentColor = usePreferenceStore((state) => state.accentColor);
  const setModalState = useModalStore((state) => state.setModalState);
  const getCurrentChat = useChatsStore((state) => state.getCurrentChat);
  const group = getCurrentChat() as GroupType;
  const { sendUpdateGroup, sendRegenInvite } = useWebSockets();

  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [isPublic, setIsPublic] = useState(group.isPublic);
  const [prompt, setPrompt] = useState("");
  const [updatePrompt, setUpdatePrompt] = useState("");

  const defaultSrc = `${import.meta.env.VITE_BACKEND_URL}/avatars/${
    group.id
  }.jpeg`;
  const [imgDataURL, setImgDataURL] = useState("");

  // errors
  const [imgError, setImgError] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

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
      copyInviteLinkToClipboard(group);
      debouncedClearPrompt();
    } else {
      sendRegenInvite(group.id);
    }
  }

  // button click handler
  function handleUpdate() {
    console.log("Got here");
    if (imgError !== "") return;
    sendUpdateGroup(group.id, name, description, isPublic, imgDataURL);
  }

  function handleImageFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    // Get the file
    const files = e.target.files;
    if (!files) return console.log("No files!");
    const file = files[0];
    console.log("Got file", file.name);

    // Check if file size exceeds limit
    if (file.size > 500000) {
      return setImgError("Profile image can't exceed 500kB");
    } else {
      setImgError("");
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      console.log(reader.result);
      setImgDataURL(reader.result as string);
    });

    reader.readAsDataURL(file);
  }

  useEffect(() => {
    const groupInfoErrorHandler = (
      data: z.infer<typeof errorGroupInfoSchema>
    ) => {
      console.log("group info error handler fired!!!");
      setNameError(data.nameError);
      setDescriptionError(data.descriptionError);
    };

    const groupUpdateHandler = (groupId: string) => {
      // ignore event if the event's group ID doesn't match this group's ID
      if (groupId !== group.id) return;

      // Clear errors
      setNameError("");
      setDescriptionError("");

      // Show "update" message prompt
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
    emitter.on("errorGroupInfo", groupInfoErrorHandler);

    return () => {
      emitter.off("groupUpdated", groupUpdateHandler);
      emitter.off("inviteSet", inviteUpdateHandler);
      emitter.off("errorGroupInfo", groupInfoErrorHandler);
    };
  }, []);

  return (
    <div className="px-16 pt-6 pb-12 bg-slate-300 dark:bg-slate-700 bg-opacity-100 z-20 rounded-xl flex flex-col">
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
          {/* Current group image OR selected image preview */}
          <img
            className="rounded-full w-60 h-60 object-cover"
            src={imgDataURL === "" ? defaultSrc : imgDataURL}
            alt="lmao"
          />
          {/* Error prompt */}
          <p className="w-full text-center italic text-sm pt-4">{imgError}</p>

          {/* Upload button */}
          <div className="mt-6">
            <label
              className="bg-slate-400 dark:bg-slate-800 hover:bg-opacity-50 dark:hover:bg-opacity-50 py-3 w-60 rounded-full font-semibold text-slate-100 text-lg outline-none cursor-pointer block text-center"
              htmlFor="pfp_upload"
            >
              Choose photo
            </label>
            <input
              id="pfp_upload"
              name="pfp_upload"
              className="hidden"
              type="file"
              accept="image/jpeg"
              onChange={handleImageFileSelect}
            />
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col w-96">
          {/* Name input */}
          <p className="pb-2 font-semibold dark:text-slate-300">Name</p>
          <input
            className="w-full py-3 px-5 bg-slate-200 dark:bg-slate-800 rounded-xl outline-none"
            placeholder="My awesome group"
            value={name}
            onChange={handleChange}
            type="text"
          />
          <p className="mt-3 text-sm italic text-slate-500 dark:text-slate-400">
            {nameError}
          </p>

          {/* Description input */}
          <p className="pb-2 mt-5 font-semibold dark:text-slate-300">
            Description
          </p>
          <textarea
            className="w-full py-3 px-5 bg-slate-200 dark:bg-slate-800 rounded-xl outline-none resize-none"
            placeholder="Simply the best group chat ever created. Change my mind"
            onInput={handleInput}
            value={description}
            rows={2}
          ></textarea>
          {/* Description error prompt */}
          <p className="mt-3 text-sm italic text-slate-500 dark:text-slate-400">
            {descriptionError}
          </p>

          {/* Public/Private toggle */}
          <div className="mt-5 flex justify-between items-center">
            {/* Label */}
            <p className="font-semibold dark:text-slate-300">
              Make this group public
            </p>

            {/* Dark mode toggle */}
            <div className="flex justify-between items-center">
              {/* Toggle */}
              <div
                className={`
                  h-8 w-16 rounded-full relative cursor-pointer transition-all
                  ${isPublic ? `bg-${accentColor}-500` : "bg-slate-400"}
                `}
                onClick={() => setIsPublic((prev) => !prev)}
              >
                {/* Slider */}
                <div
                  className={`
                    h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 absolute top-1 transition-all
                    ${isPublic ? "left-9" : "left-1"}
                  `}
                ></div>
              </div>
            </div>
          </div>

          {/* Public/Private toggle warning */}
          {!isPublic && (
            <p className="italic text-sm mt-3 text-slate-600 dark:text-slate-400 select-none">
              New members need an invite link to join a private group.
            </p>
          )}

          {/* Invite link container */}
          <div className="mt-6">
            {/* Container header */}
            <div className="flex gap-4 mb-2">
              {/* Label */}
              <p className="flex-shrink-0 mr-auto font-semibold dark:text-slate-300">
                Invite Link
              </p>
              {prompt && (
                <p className="text-slate-600 dark:text-slate-400 select-none">
                  {prompt}
                </p>
              )}

              {/* Copy invite link button */}
              <FontAwesomeIcon
                className={`text-${accentColor}-500 hover:text-${accentColor}-400 cursor-pointer`}
                size="lg"
                icon={faClipboard}
                onClick={() => handleInviteClick("copy")}
              />

              {/* Reset invite link button */}
              <FontAwesomeIcon
                className={`text-${accentColor}-500 hover:text-${accentColor}-400 cursor-pointer`}
                size="lg"
                icon={faRotateRight}
                onClick={() => handleInviteClick("reset")}
              />
            </div>

            {/* Content */}
            <div className="flex items-center gap-3 w-full py-3 px-0 bg-slate-200 dark:bg-slate-800 rounded-xl outline-none select-none">
              {/* Actual invite link is displayed here */}
              <p className="text-slate-600 dark:text-slate-300 w-full text-center mr-auto text-[13px] select-text">
                {`${import.meta.env.VITE_REACT_APP_URL}/invite/${
                  group.inviteCode
                }`}
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
          className={`bg-${accentColor}-500 hover:bg-${accentColor}-400 px-6 h-14 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center`}
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
