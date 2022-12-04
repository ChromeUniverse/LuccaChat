import React from "react";
import {
  faCheck,
  faXmark,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRequestsStore } from "../zustand/requests-store";
import { RequestType } from "../data";
import { useChatsStore } from "../zustand/chats-store";
import useWebSockets from "../hooks/useWebSockets";

interface ButtonProps {
  type: "accept" | "reject";
  request: RequestType;
}

// Request accept/reject button component
function Button({ type, request }: ButtonProps) {
  const { sendRemoveRequest } = useWebSockets();

  const removeRequest = useRequestsStore((state) => state.removeRequest);
  const createNewDM = useChatsStore((state) => state.createNewDM);

  function handleClick() {
    removeRequest(request.id);
    sendRemoveRequest(request.id, type);
  }

  return (
    <div
      className="group w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 flex items-center justify-center cursor-pointer"
      onClick={handleClick}
    >
      <FontAwesomeIcon
        className="group-hover:text-white dark:text-slate-300 dark:group-hover:text-slate-200"
        icon={type === "accept" ? faCheck : faXmark}
      />
    </div>
  );
}

interface Props {
  request: RequestType;
}

function Request({ request }: Props) {
  return (
    <div className="flex items-center gap-3 w-full">
      {/* Avatar */}
      <img
        className="w-14 h-14 rounded-full flex-shrink-0"
        src={`${import.meta.env.VITE_BACKEND_URL}/avatars/${
          request.sender.id
        }.jpeg`}
        alt=""
      />
      {/* Name */}
      <p className="text-lg">{request.sender.name}</p>
      {/* Buttons container */}
      <div className="flex gap-2 ml-auto">
        <Button type="reject" request={request} />
        <Button type="accept" request={request} />
      </div>
    </div>
  );
}

export default Request;
