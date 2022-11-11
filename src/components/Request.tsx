import React from 'react'
import { faCheck, faXmark, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { RequestType, useRequestsStore } from '../zustand/requests-store'
import { useChatsStore } from '../zustand/chats-store';

interface ButtonProps {
  type: 'accept' | 'reject';
  request: RequestType;
}

// Request accept/reject button component
function Button({ type, request }: ButtonProps) {
  
  const removeRequest = useRequestsStore(state => state.removeRequest);  
  const createNewDM = useChatsStore(state => state.createNewDM);

  const reject = () => {
    removeRequest(request.id);
  }

  // NOTE: todo!
  const accept = () => {
    removeRequest(request.id);
    createNewDM(request.sender);
  }

  return (
    <div
      className="group w-10 h-10 rounded-full bg-slate-300 hover:bg-slate-400 flex items-center justify-center cursor-pointer"
      onClick={type === "accept" ? accept : reject}
    >
      <FontAwesomeIcon
        className="group-hover:text-white"
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
    <div className='flex items-center gap-3 w-full'>
      {/* Avatar */}
      <img className='w-14 h-14 rounded-full flex-shrink-0' src={request.sender.pfp_url} alt="" />
      {/* Name */}
      <p className='text-lg'>{request.sender.name}</p>
      {/* Buttons container */}
      <div className='flex gap-2 ml-auto'>
        <Button type="reject" request={request} />
        <Button type="accept" request={request}/>
      </div>
    </div>
  )
}

export default Request