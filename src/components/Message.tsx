import React, { useState } from "react";
import avatar from "../assets/avatar.jpeg";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-regular-svg-icons";
import {
  faCircleInfo,
  faEllipsisH,
  faTrash,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";


// A line inside the dropdown menu
function MenuLine({text, icon, danger = false} : {text:string, icon: IconDefinition, danger?: boolean}) {
  return (
    <div className={`flex w-full justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-slate-400 hover:bg-opacity-30 ${danger ? 'mt-2' : ''}`}>
      <p className={danger ? "text-red-500 font-semibold" : ''}>{text}</p>
      <FontAwesomeIcon
        className={`w-6 text-center ${danger ? 'text-red-500 font-semibold' : ''}`}
        icon={icon}
        size="lg"
      />
    </div>
  );
}

// The message's dropdown menu
function DropdownMenu({menuOpen} : {menuOpen: boolean}) {
  return (
    <div
      className={`
        absolute -top-2 right-14 px-2 py-2 w-52 bg-slate-300 rounded-md flex flex-col gap-1 transition-all select-none
        ${menuOpen ? '-top-2' : '-z-10 -top-4'}
      `}
    >
      <MenuLine text="Copy content" icon={faClipboard} />
      <MenuLine text="Sender info" icon={faCircleInfo} />
      <MenuLine text="Delete message" icon={faTrash} danger />
    </div>
  );
}


interface Props {
  id: number
  open: boolean;
  handleClick: (id: number) => void;
}

function Message({id, open, handleClick}: Props) {

  return (
    <div
      className={`
      group relative pl-6 pr-10 grid grid-cols-[3rem_auto] items-start gap-3 py-4 hover:bg-slate-300 rounded-lg hover:bg-opacity-40
      ${open ? "bg-slate-300 bg-opacity-40" : ""}
    `}
    >
      {/* User Avatar */}
      <div className="bg-slate-900 w-12 h-12 flex items-center justify-center rounded-full select-none">
        <img className="w-[90%] rounded-full" src={avatar} alt="" />
      </div>

      {/* Messsage content */}
      <div className="flex flex-col">
        <h3 className="font-semibold text-xl text-orange-500">
          Lucca Rodrigues
        </h3>
        <p className="">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vitae
          dictum sem. Pellentesque sollicitudin dictum quam, eget consequat
          lorem efficitur auctor. Sed pretium ipsum vel congue aliquam. Nulla
          scelerisque vestibulum diam, quis consectetur ipsum lacinia eu.
          Praesent luctus dolor vitae lectus ultricies, non scelerisque odio
          iaculis. Ut diam est, vulputate vel eros eu, sodales dignissim sem.
          Sed eget suscipit felis, volutpat scelerisque neque.
        </p>
      </div>

      {/* Options menu button */}
      <div
        className={`
          absolute -top-2 right-4 group-hover:flex w-8 h-8 rounded-lg bg-slate-300 items-center justify-center cursor-pointer hover:brightness-95
          ${open ? "flex brightness-95" : "hidden"}
        `}
        onClick={() => handleClick(id)}
      >
        {/* Ellipsis icon */}
        <FontAwesomeIcon className="text-slate-500" icon={faEllipsisH} />
      </div>

      {/* Dropdown menu */}
      {/* TODO: finish this component!!! */}
      <DropdownMenu menuOpen={open} />
    </div>
  );
}

export default Message;
