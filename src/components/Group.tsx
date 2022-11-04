import React from "react";

interface Props {
  name: string;
  members: number;
}

function Group({ name, members }: Props) {
  return (
    <div className="px-3 py-2 w-full flex items-center gap-3 hover:bg-slate-400 hover:bg-opacity-20 rounded-lg cursor-pointer">
      {/* Avatar */}
      <div className="w-14 h-14 bg-slate-400 rounded-full"></div>

      {/* Group Name */}
      <div className="flex flex-col">
        <h3 className="font-normal text-xl">{name}</h3>
        <p className="font-normal text-sm">{members.toLocaleString()} members</p>
      </div>
    </div>
  );
}

export default Group;
