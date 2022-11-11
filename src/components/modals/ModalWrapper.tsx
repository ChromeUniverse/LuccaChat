import React from "react";
import { useModalStore } from "../../zustand/modals-store";
import AddChat from "./AddChat";
import AddFriend from "./AddFriend";
import CreateGroup from "./CreateGroup";
import DeleteGroup from "./DeleteGroup";
import GroupSettings from "./GroupSettings";
import LeaveGroup from "./LeaveGroup";

type Props = {};

function ModalWrapper({}: Props) {
  const modalState = useModalStore((state) => state.modalState);

  return (
    <>
      {modalState && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          {/* Dark translucent background */}
          <div className="absolute z-10 bg-slate-900 w-full h-full opacity-80"></div>
          {modalState === "add-chat" && <AddChat />}
          {modalState === "add-friend" && <AddFriend />}
          {modalState === "create-group" && <CreateGroup />}
          {modalState === "group-settings" && <GroupSettings />}
          {modalState === "leave-group" && <LeaveGroup />}
          {modalState === "delete-group" && <DeleteGroup />}
        </div>
      )}
    </>
  );
}

export default ModalWrapper;
