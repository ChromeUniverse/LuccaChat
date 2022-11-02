import React from 'react'

// Test photo
import creeper from '../assets/creeper.webp'

// Components
import Message from './Message'
import TextareaAutosize from 'react-textarea-autosize';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV, faPaperPlane } from '@fortawesome/free-solid-svg-icons'

type Props = {}

function Chat({ }: Props) {

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const newInput = e.currentTarget.value;
  }

  return (
    <main className="flex flex-col bg-slate-200 h-screen">
      {/* Chat Header */}
      <div className="w-full bg-slate-300 pl-5 pr-8 h-20 flex items-center flex-shrink-0">
        {/* Avatar */}
        <div className="bg-slate-900 w-12 h-12 flex flex-shrink-0 items-center justify-center rounded-full">
          <img className="w-[90%] rounded-full" src={creeper} alt="" />
        </div>

        {/* Name */}
        <div className="flex flex-col pl-3">
          <h3 className="font-normal text-xl">The Best Group Chat Ever</h3>
          <p className="font-normal text-sm">99 participants • 22 online</p>
        </div>

        {/* Ellipsis icon */}
        <FontAwesomeIcon className='ml-auto cursor-pointer' icon={faEllipsisV} size="xl"/>
      </div>

      {/* Messages container */}
      <div className="px-4 flex flex-col-reverse gap-2 w-full h-full overflow-y-auto">
        <Message />
        <Message />
        <Message />
        <Message />
      </div>

      {/* Chat footer */}
      <div className="flex-shrink-0 min-h-[5rem] w-full px-10 py-4 bg-slate-300 flex flex-row items-end gap-4">
        {/* Text input */}
        <TextareaAutosize className="bg-slate-200 rounded-md py-3 px-4 flex-grow outline-none resize-none" onInput={handleInput}/>
        {/* Send button */}
        <div className="bg-slate-200 h-12 w-12 rounded-full relative cursor-pointer">
          <FontAwesomeIcon
            className="text-slate-500 absolute top-[14px] left-[12px]"
            icon={faPaperPlane}
            size="lg"
          />
        </div>
      </div>
    </main>
  );
}

export default Chat