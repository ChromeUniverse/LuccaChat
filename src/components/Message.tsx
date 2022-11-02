import React from 'react'
import avatar from '../assets/avatar.jpeg'

type Props = {}

function Message({}: Props) {
  return (
    <div className='pl-6 grid grid-cols-[3rem_auto] items-start gap-3 py-4 hover:bg-slate-300 rounded-lg hover:bg-opacity-40'>
      {/* User Avatar */}      
      <div className="bg-slate-900 w-12 h-12 flex items-center justify-center rounded-full">
        <img className="w-[90%] rounded-full" src={avatar} alt="" />
      </div>

      {/* Messsage content */}
      <div className='flex flex-col'>
        <h3 className="font-semibold text-xl text-orange-500">Lucca Rodrigues</h3>
        <p className=''>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vitae dictum sem. Pellentesque sollicitudin dictum quam, eget consequat lorem efficitur auctor. Sed pretium ipsum vel congue aliquam. Nulla scelerisque vestibulum diam, quis consectetur ipsum lacinia eu. Praesent luctus dolor vitae lectus ultricies, non scelerisque odio iaculis. Ut diam est, vulputate vel eros eu, sodales dignissim sem. Sed eget suscipit felis, volutpat scelerisque neque.</p>
      </div>
    </div>
  )
}

export default Message