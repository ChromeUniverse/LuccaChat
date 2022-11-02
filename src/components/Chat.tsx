import React from 'react'
import creeper from '../assets/creeper.webp'
import Message from './Message'

type Props = {}

function Chat({}: Props) {
  return (
    <main className="flex flex-col bg-slate-200 h-screen">
      {/* Chat Header */}
      <div className="w-full bg-slate-300 px-5 h-20 flex flex-shrink-0 items-center">
        {/* Avatar */}
        <div className="bg-slate-900 w-12 h-12 flex items-center justify-center rounded-full">
          <img className="w-[90%] rounded-full" src={creeper} alt="" />
        </div>

        {/* Name */}
        <div className="flex flex-col pl-3">
          <h3 className="font-normal text-xl">The Best Group Chat Ever</h3>
          <p className="font-normal text-sm">99 participants • 22 online</p>
        </div>
      </div>

      {/* Messages container */}
      <div className="pl-4 pr-12 flex flex-col-reverse gap-2 w-full overflow-y-auto">
        <Message />
        <Message />
        <Message />
        <Message />
      </div>
    </main>
  );
}

export default Chat