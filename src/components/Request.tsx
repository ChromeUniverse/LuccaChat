import { faCheck, faXmark, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

type Props = {
  name: string
}

// Request accept/reject button component
function Button({ type }: {type: 'accept' | 'reject'}) {

  const icon = type === 'accept' ? faCheck : faXmark;

  return (
    <div className="group w-10 h-10 rounded-full bg-slate-300 hover:bg-slate-400 flex items-center justify-center cursor-pointer">
      <FontAwesomeIcon className='group-hover:text-white' icon={icon}/>      
    </div>
  );
}
 
function Request({name}: Props) {
  return (
    <div className='flex items-center gap-3 w-full'>
      {/* Avatar */}
      <div className='w-14 h-14 rounded-full bg-slate-400 flex-shrink-0'></div>
      {/* Name */}
      <p className='text-lg'>{name}</p>
      {/* Buttons container */}
      <div className='flex gap-2 ml-auto'>
        <Button type="reject"/>
        <Button type="accept"/>
      </div>
    </div>
  )
}

export default Request