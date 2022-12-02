import React, { useEffect, useState } from "react";
import creeper from "../../assets/creeper.webp";

// Font Awesome
import {
  faAngleRight,
  faArrowLeft,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Zustand
import { useModalStore } from "../../zustand/modals-store";
import { useChatsStore } from "../../zustand/chats-store";
import { emitter } from "../../routes/App";
import useWebSockets from "../../hooks/useWebSockets";
import { z } from "zod";
import { errorGroupInfoSchema } from "../../../../server/src/zod/schemas";

type Props = {};

function CreateGroup({}: Props) {
  const setModalState = useModalStore((state) => state.setModalState);
  const { sendCreateGroup } = useWebSockets();
  const createNewGroup = useChatsStore((state) => state.createNewGroup);

  // form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
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

  function handleClick() {
    if (
      name === "" ||
      description === "" ||
      imgError !== "" ||
      imgDataURL === ""
    )
      return;
    sendCreateGroup(name, description, isPublic, imgDataURL);
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

    const ackGroupHandler = () => {
      // Clear errors, close modal
      setNameError("");
      setDescriptionError("");
      setModalState(null);
    };

    emitter.on("groupCreated", ackGroupHandler);
    emitter.on("errorGroupInfo", groupInfoErrorHandler);

    return () => {
      emitter.off("groupCreated", ackGroupHandler);
      emitter.off("errorGroupInfo", groupInfoErrorHandler);
    };
  }, []);

  return (
    <div className="px-16 pt-6 pb-12 bg-slate-300 bg-opacity-100 z-20 rounded-xl flex flex-col">
      {/* Modal header */}
      <div className="flex flex-row w-full items-center">
        <FontAwesomeIcon
          className="cursor-pointer py-[6px] pr-6"
          icon={faArrowLeft}
          size="lg"
          onClick={() => setModalState("add-chat")}
        />
        <h2 className="py-3 text-2xl font-semibold">Create a new group</h2>
      </div>

      {/* Modal content */}
      <div className="flex mt-10 gap-10">
        {/* Upload picture */}
        <div className="flex flex-col w-60">
          {/* Group picture */}
          {imgDataURL !== "" ? (
            // Image selected
            <img className="rounded-full w-60 h-60" src={imgDataURL} alt="" />
          ) : (
            // Placeholder
            <div className="rounded-full w-60 h-60 bg-slate-300 border-8 border-slate-400 flex justify-center items-center">
              {/* <p className="text-slate-400"></p> */}
              <FontAwesomeIcon
                className="text-slate-400 text-7xl"
                icon={faUsers}
              />
            </div>
          )}

          {/* Image error prompt */}
          <p className="w-full text-center italic text-sm pt-4">{imgError}</p>

          {/* Upload button */}
          <div className="mt-6">
            <label
              className="bg-slate-400 hover:bg-opacity-50 py-3 w-60 rounded-full font-semibold text-slate-100 text-lg outline-none cursor-pointer block text-center"
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
          <p className="pb-2">Name</p>
          <input
            className="w-full py-3 px-5 bg-slate-200 rounded-xl outline-none"
            placeholder="My awesome group"
            value={name}
            onChange={handleChange}
            type="text"
          />
          <p className="mt-3 text-sm italic text-slate-500">{nameError}</p>

          {/* Description input */}
          <p className="pb-2 mt-5">Description</p>
          <textarea
            className="w-full py-3 px-5 bg-slate-200 rounded-xl outline-none resize-none"
            placeholder="Simply the best group chat ever created. Change my mind"
            onInput={handleInput}
            value={description}
            rows={3}
          ></textarea>
          <p className="mt-3 text-sm italic text-slate-500">
            {descriptionError}
          </p>

          {/* Public/Private toggle */}
          <div className="mt-5 flex justify-between items-center">
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

          {/* Extra info */}
          <p className="italic text-sm mt-3 text-slate-600">
            New members will need an invite link to join a private group. You
            can change this at any time.
          </p>
        </div>
      </div>

      {/* Modal footer */}
      <div className="flex w-full pt-6">
        <div
          className={`
            bg-slate-400 w-14 h-14 rounded-full flex-shrink-0 ml-auto flex items-center justify-center
            ${
              name === "" ||
              description === "" ||
              imgError !== "" ||
              imgDataURL === ""
                ? "bg-opacity-50"
                : "cursor-pointer hover:bg-opacity-50"
            }
          `}
          onClick={handleClick}
        >
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

export default CreateGroup;
