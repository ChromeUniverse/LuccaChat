import React, { useState } from 'react'

// Font Awesome
import { faAngleRight, faArrowLeft, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Zustand
import { useModalStore } from '../../zustand/modals-store';
import { useChatsStore } from '../../zustand/chats-store';
import { GroupType } from '../../data';
import { useInfoStore } from '../../zustand/info-panel-store';

function DeleteGroup() {

  const setModalState = useModalStore(state => state.setModalState);
  const closeInfo = useInfoStore(state => state.closeInfo)
  const removeGroup = useChatsStore(state => state.removeGroup);
  const getCurrentChat = useChatsStore(state => state.getCurrentChat);

  const chat = getCurrentChat() as GroupType;

  if (chat.type !== 'group') throw new Error("'Leave Group' modals should only be visible from 'Group' chats");  

  function handleClick() {
    console.log('YOLO'); 
    setModalState(null);
    removeGroup(chat.id);
    closeInfo();
  }

  return (
    <div className="w-[600px] px-12 pt-8 pb-10 bg-slate-300 bg-opacity-100 z-20 rounded-xl flex flex-col items-start">
      {/* Modal Header */}
      <div className="w-full flex justify-between">
        <h2 className="py-0 text-2xl font-semibold">Delete this group?</h2>
        <FontAwesomeIcon
          className="cursor-pointer py-[6px]"
          icon={faXmark}
          size="lg"
          onClick={() => setModalState(null)}
        />
      </div>

      {/* Modal description */}
      <p className="font-normal pt-10 pb-4">
        Are you sure you want to delete this group? This effectively means disbanding this group. This action is <span className='font-bold'>irreversible</span>!
      </p>

      {/* Modal footer */}
      <div className="self-end mt-auto pt-6 items-center gap-6">
        <div
          className="bg-red-500 px-6 h-14 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center hover:bg-opacity-50"
          onClick={handleClick}
        >
          <p className="font-semibold text-slate-200 text-lg mr-3">Delete</p>
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

export default DeleteGroup;