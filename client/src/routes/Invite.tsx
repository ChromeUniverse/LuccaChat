import mitt from "mitt";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { chatSchema } from "../../../server/src/zod/api-chats";
import { joinGroupAckSchema } from "../../../server/src/zod/schemas";
import fetchCurrentUser from "../api/fetchCurrentUser";
import fetchGroupByInvite from "../api/fetchGroupByInvite";
import { GroupType } from "../data";
import useWebSockets from "../hooks/useWebSockets";

type Props = {};

type Events = {
  gotJoinGroupAck: z.infer<typeof joinGroupAckSchema>;
};

export const inviteEmitter = mitt<Events>();

function Invite({}: Props) {
  type chatType = z.infer<typeof chatSchema>;
  const [groupData, setGroupData] = useState<chatType>();
  const [errorMsg, setErrorMsg] = useState("");

  // Extract router data/functions
  const { inviteCode } = useParams();
  const navigate = useNavigate();

  // websockets
  const { sendJoinGroup } = useWebSockets();

  // Fetch group data
  useEffect(() => {
    async function fetchGroupData() {
      if (!inviteCode) throw new Error("Received no invite code.");

      const { data, status } = await fetchGroupByInvite(inviteCode);

      console.log(data);
      if (data) setGroupData(data);
    }
    fetchGroupData();
  }, []);

  // Event handler
  useEffect(() => {
    const handler = ({ error, msg }: z.infer<typeof joinGroupAckSchema>) => {
      // got error
      if (error && msg) return setErrorMsg(msg);
      if (!error) return navigate("/app");
      navigate("/app");
      // window.location.href = "/app";
    };

    inviteEmitter.on("gotJoinGroupAck", handler);

    return () => {
      inviteEmitter.off("gotJoinGroupAck", handler);
    };
  }, []);

  async function handleClick() {
    const group = groupData as chatType;

    // first, check if this user is logged in...
    const { id } = await fetchCurrentUser();
    if (!id) return navigate("/");

    // second, check if they're already a part of this group...
    const memberIds = group.members.map((m) => m.id);
    if (!memberIds.includes(id)) {
      // ...
      console.log("Already a member of this group");
    }

    // third, send the "join group" request over websockets
    sendJoinGroup(group.id);
  }

  // Loading indicator
  if (!groupData) return <div>loading...</div>;

  return (
    <div className="bg-slate-200 w-screen h-screen">
      {/* Group name */}
      <h1 className="font-light text-3xl">
        You've been invited to join{" "}
        <span className="font-semibold">{groupData.name}</span>
      </h1>

      {/* Join CTA button */}
      <button
        className="bg-slate-400 rounded-full text-xl font-semibold text-white px-10 py-2 hover:bg-opacity-50"
        onClick={handleClick}
      >
        Join
      </button>

      {/* Error message */}
      <p className="text-red-500 font-semibold">{errorMsg}</p>
    </div>
  );
}

export default Invite;
