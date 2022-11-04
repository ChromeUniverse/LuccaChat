import React from 'react'
import avatar from "../assets/avatar.jpeg";

// Components
import Contact from './Contact';
import Group from './Group';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faXmark, IconDefinition } from '@fortawesome/free-solid-svg-icons'

function FooterMenuLine({text, icon}: {text:string, icon: IconDefinition}) {
  return (
    <div className="pl-5 py-2 flex justify-start items-center gap-3 hover:bg-slate-200 rounded-md cursor-pointer">
      <FontAwesomeIcon className="w-6 text-red-500" icon={icon} size="lg" />
      <p className="font-semibold text-red-500 text-lg">{text}</p>
    </div>
  );
}

type Props = {
  setInfoOpen: (value: 'user' | 'group' | null) => void;
}

function UserInfo({setInfoOpen}: Props) {
  return (
    <div className="w-[330px] h-screen flex-shrink-0 bg-slate-100 flex flex-col items-center">
      {/* Header */}
      <div className="flex-shrink-0 h-20 w-full bg-slate-300 flex items-center gap-4 pl-5">
        <FontAwesomeIcon
          className="cursor-pointer flex-shrink-0"
          icon={faXmark}
          size="lg"
          onClick={() => setInfoOpen(null)}
        />
        <p className="text-xl">Contact Info</p>
      </div>

      {/* Content */}
      <div className="w-full h-full pt-10 flex flex-col items-center gap-6 overflow-auto">
        {/* User Avatar */}
        <img className="w-60 rounded-full" src={avatar} alt="" />
        {/* User name/handle */}
        <div className="flex flex-col gap-1 items-center">
          <p className="text-2xl font-semibold">Lucca Rodrigues</p>
          <p className="text-md">@lucca</p>
        </div>

        {/* Groups in common */}
        <div className="px-4 w-full flex flex-col mt-2">
          <p className="font-semibold py-2">Groups in common</p>
          <Group name="Awesome Group 1" members={1162} />
          <Group name="Awesome Group 1" members={99} />
          <Group name="Awesome Group 1" members={99} />
        </div>

        {/* Footer menu */}
        <div className="mt-auto px-4 py-5 w-full flex flex-col gap-1">
          <FooterMenuLine text='Kick Lucca Rodrigues' icon={faXmark} />
          <FooterMenuLine text='Ban Lucca Rodrigues' icon={faBan}/>
        </div>
      </div>
    </div>
  );
}

export default UserInfo