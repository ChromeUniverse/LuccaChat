import React, { useEffect, useState } from "react";

// Font Awesome
import {
  faAngleRight,
  faArrowLeft,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Zustand
import { useModalStore } from "../../zustand/modals-store";
import { useChatsStore } from "../../zustand/chats-store";
import { GroupType, UserType } from "../../data";
import { useInfoStore } from "../../zustand/info-panel-store";
import { emitter } from "../../routes/App";
import { removeMemberSchema } from "../../../../server/src/zod/schemas";
import { z } from "zod";
import useWebSockets from "../../hooks/useWebSockets";

export default function KickMember() {
  // hooks
  const setModalState = useModalStore((state) => state.setModalState);
  const getCurrentChat = useChatsStore((state) => state.getCurrentChat);
  const currentGroup = getCurrentChat() as GroupType;
  const member = useInfoStore((state) => state.data) as UserType;
  const { sendKickMember } = useWebSockets();

  function handleClick() {
    sendKickMember(currentGroup.id, member.id);
  }

  useEffect(() => {
    const memberKickedHandler = (data: z.infer<typeof removeMemberSchema>) => {
      // ignore if event's group ID doesn't match current Group ID
      if (data.groupId !== currentGroup.id) return;
      console.log("member kicked handler fired!");
      setModalState(null);
    };

    emitter.on("memberKicked", memberKickedHandler);

    return () => {
      emitter.off("memberKicked", memberKickedHandler);
    };
  }, []);

  return (
    <div className="w-[600px] px-12 pt-8 pb-10 bg-slate-300 dark:bg-slate-700 bg-opacity-100 z-20 rounded-xl flex flex-col items-start">
      {/* Modal Header */}
      <div className="w-full flex justify-between">
        <h2 className="py-0 text-2xl font-semibold">Kick this member?</h2>
        <FontAwesomeIcon
          className="cursor-pointer py-[6px]"
          icon={faXmark}
          size="lg"
          onClick={() => setModalState(null)}
        />
      </div>

      {/* Modal description */}
      <p className="font-normal pt-10 pb-0 text-md dark:text-slate-300">
        Are you sure you want to kick this member?
        <br /> I mean, if you really wanna kick 'em, fine! Just DO IT!
        <br />
        <br />
        <span className="strong-tilt-move-shake font-bold text-2xl">
          DEW IT!
        </span>
      </p>

      {/* Modal footer */}
      <div className="self-end mt-auto pt-6 items-center gap-6">
        <div
          className="bg-red-500 px-6 h-14 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center hover:bg-red-400"
          onClick={handleClick}
        >
          <p className="font-semibold text-slate-200 text-lg mr-3">Kick 'em!</p>
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
