import React, { useEffect } from "react";
import { useModalStore } from "../../zustand/modals-store";
import AccountSettings from "./AccountSettings";
import AddChat from "./AddChat";
import AddFriend from "./AddFriend";
import CreateGroup from "./CreateGroup";
import DeleteGroup from "./DeleteGroup";
import GroupSettings from "./GroupSettings";
import LeaveGroup from "./LeaveGroup";

type Props = {};

function ModalWrapper({}: Props) {
  const modalState = useModalStore((state) => state.modalState);
  const setModalState = useModalStore((state) => state.setModalState);

  // Escape key click handler
  useEffect(() => {
    const handleEscPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modalState === "add-friend") setModalState("add-chat");
        else if (modalState === "create-group") setModalState("add-chat");
        else setModalState(null);
      }
    };

    window.addEventListener("keydown", handleEscPress);

    return () => {
      window.removeEventListener("keydown", handleEscPress);
    };
  }, [modalState]);

  return (
    <>
      {modalState && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          {/* Dark translucent background */}
          <div className="absolute z-20 bg-slate-900 w-full h-full opacity-80"></div>
          {modalState === "add-chat" && <AddChat />}
          {modalState === "add-friend" && <AddFriend />}
          {modalState === "create-group" && <CreateGroup />}
          {modalState === "group-settings" && <GroupSettings />}
          {modalState === "leave-group" && <LeaveGroup />}
          {modalState === "delete-group" && <DeleteGroup />}
          {modalState === "account-settings" && <AccountSettings />}
        </div>
      )}
    </>
  );
}

export default ModalWrapper;
