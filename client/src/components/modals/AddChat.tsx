import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useChatsStore } from "../../zustand/chats-store";
import { useInfoStore } from "../../zustand/info-panel-store";
import { ModalState, useModalStore } from "../../zustand/modals-store";
import { useBrowserStore } from "../PublicGroupBrowser";

interface CardProps {
  imgSrc: string;
  description: string;
  btnText: string;
  nextModal: ModalState;
  override?: boolean;
}

function Card({
  description,
  imgSrc,
  btnText,
  nextModal,
  override,
}: CardProps) {
  // zustand actions
  const closeInfo = useInfoStore((state) => state.closeInfo);
  const closeChat = useChatsStore((state) => state.closeChat);
  const setModalState = useModalStore((state) => state.setModalState);
  const setOpen = useBrowserStore((state) => state.setOpen);

  // onClick handlers
  const setNextModal = () => setModalState(nextModal);
  const setNextPublicGroupBrowser = () => {
    closeInfo();
    closeChat();
    setModalState(null);
    setOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col items-center gap-6">
      {/* Card content */}
      <div className="bg-slate-200 dark:bg-slate-600 w-full h-72 py-4 rounded-lg flex flex-col items-center gap-4">
        {/* Card image */}
        <img
          className="w-36 h-36 rounded-full object-cover"
          src={imgSrc}
          alt=""
        />
        {/* Card description */}
        <p className="px-6 text-lg">{description}</p>
      </div>

      {/* Card button */}
      <button
        className="bg-slate-400 dark:bg-slate-800 text-slate-100 text-lg w-full py-3 rounded-full text-center font-semibold outline-none hover:bg-slate-500 dark:hover:bg-opacity-50"
        onClick={() =>
          override ? setNextPublicGroupBrowser() : setNextModal()
        }
      >
        {btnText}
      </button>
    </div>
  );
}

function AddChat() {
  const setModalState = useModalStore((state) => state.setModalState);

  return (
    <div className="h-[550px] w-[900px] px-16 pt-6 pb-20 bg-slate-300 dark:bg-slate-700 bg-opacity-100 z-20 rounded-xl flex flex-col justify-between">
      {/* Modal header */}

      <div className="flex flex-row w-full items-center justify-between">
        <h2 className="py-3 text-2xl font-semibold">Add a new chat</h2>
        <FontAwesomeIcon
          className="cursor-pointer"
          icon={faXmark}
          size="xl"
          onClick={() => setModalState(null)}
        />
      </div>

      {/* Cards container */}
      <div className="mt-6 px-6 flex flex-row gap-8">
        <Card
          description="Chat privately with friends in DMs"
          imgSrc="https://cdn.kapwing.com/video_image-qEslsWspL.jpg"
          btnText="Add Friend"
          nextModal="add-friend"
        />
        <Card
          description="Start a new group chat and take over the world"
          imgSrc="https://i.imgur.com/fI1srA1.gif"
          btnText="Create Group"
          nextModal="create-group"
        />
        <Card
          description="Join a public group and hang out with internet strangers"
          imgSrc="https://media.tenor.com/NpuPnuLlEGEAAAAM/jim-carrey.gif"
          btnText="Browse Groups"
          nextModal="browse-groups"
          override
        />
      </div>
    </div>
  );
}

export default AddChat;
