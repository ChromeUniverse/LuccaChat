import React, { useState } from "react";
import creeper from "../../assets/creeper.webp";

// Font Awesome
import { faAngleRight, faArrowLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Zustand
import { useModalStore } from "../../zustand/modals-store";
import { useChatsStore } from "../../zustand/chats-store";

type Props = {};

function CreateGroup({}: Props) {
  const setModalState = useModalStore((state) => state.setModalState);

  const createNewGroup = useChatsStore(state => state.createNewGroup);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    setDescription(e.currentTarget.value);
  }

  function handleClick() {
    createNewGroup(name, description, isPublic);
    setModalState(null);
  }

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
          <img className="rounded-full w-full" src={creeper} alt="" />

          {/* Upload button */}
          <button className="bg-slate-400 hover:bg-opacity-50 mt-auto w-full rounded-full font-semibold text-slate-100 text-lg py-2 outline-none">
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
            rows={2}
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

          {/* Extra info */}
          <p className="italic text-sm mt-3">
            New members will need an invite link to join a private group. You
            can change this at any time.
          </p>
        </div>
      </div>

      {/* Modal footer */}
      <div className="flex w-full pt-6">
        <div
          className="bg-slate-400 w-14 h-14 rounded-full flex-shrink-0 ml-auto cursor-pointer flex items-center justify-center hover:bg-opacity-50"
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
