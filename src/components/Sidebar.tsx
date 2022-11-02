import React from 'react'
import avatar from '../assets/avatar.jpeg'
import Contact from './Contact'

type Props = {}

function Sidebar({}: Props) {
  return (
    <section className="w-[330px] bg-slate-100 flex flex-col h-screen">
      {/* Sidebar Header */}
      <div className="flex-shrink-0 w-full bg-slate-300 px-5 h-20 flex items-center">
        {/* Avatar */}
        <div className="bg-slate-900 w-12 h-12 flex items-center justify-center rounded-full">
          <img className="w-[90%] rounded-full" src={avatar} alt="" />
        </div>

        {/* Name */}
        <div className="flex flex-col pl-3">
          <h3 className="font-normal text-xl">Lucca Rodrigues</h3>
          <p className="font-bold text-sm">@lucca</p>
        </div>
      </div>

      {/* Main Sidebar content */}
      <div className="flex flex-col px-4 w-full h-full overflow-hidden">
        {/* Tabs */}
        <div className="relative mt-2 p-1 bg-slate-300 flex rounded-md">
          <p className="flex-1 text-center">Chats</p>
          <p className="flex-1 text-center">Requests</p>
          <div className="top-7 left-[0%] absolute w-[50%] h-1 bg-black rounded-full"></div>
        </div>

        {/* Search bar */}
        <div className="w-full mt-2.5 bg-slate-200 rounded-md">
          <input
            className="w-full px-3 py-3 bg-transparent"
            placeholder="Search chats"
            type="text"
          />
        </div>

        {/* Contacts container */}
        <div className="flex flex-col mt-3 gap-1 overflow-y-auto">
          <Contact name="Contact A" handle="handle" />
          <Contact name="Contact B" handle="handle" />
          <Contact name="Contact C" handle="handle" />
          <Contact name="Contact D" handle="handle" />
          <Contact name="Contact E" handle="handle" />
          <Contact name="Contact F" handle="handle" />
          <Contact name="Contact G"handle="handle" />
          <Contact name="Contact H" handle="handle" />
          <Contact name="Contact I" handle="handle" />
          <Contact name="Contact J" handle="handle" />
          <Contact name="Contact K" handle="handle" />
        </div>

      </div>

      {/* Sidebar Foooter */}
      <div className="mt-auto p-4 bg-slate-300 flex items-center justify-center">
        <p className="font-semibold text-2xl">LuccaChat</p>
      </div>
    </section>
  );
}

export default Sidebar