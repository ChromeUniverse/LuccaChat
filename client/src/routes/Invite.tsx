import { faCommentDots } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { formatDate } from "../misc";

type Props = {};

type Events = {
  gotJoinGroupAck: z.infer<typeof joinGroupAckSchema>;
};

export const inviteEmitter = mitt<Events>();

function Logo() {
  return (
    <div className="flex gap-4">
      <h1 className="text-4xl text-white font-semibold">LuccaChat</h1>
      <FontAwesomeIcon
        className="text-4xl text-white inline"
        icon={faCommentDots}
      />
    </div>
  );
}

function Invite({}: Props) {
  type chatType = z.infer<typeof chatSchema>;
  const [groupData, setGroupData] = useState<chatType>();
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  console.log(notFound);

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

      console.log(data, status);
      if (data) setGroupData(data);
      if (status === 404 || status === -1) setNotFound(true);
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
    const { data } = await fetchCurrentUser();
    if (!data) return navigate("/");

    // second, check if they're already a part of this group...
    const memberIds = group.members.map((m) => m.id);
    if (!memberIds.includes(data.id)) {
      // ...
      console.log("Already a member of this group");
    }

    // third, send the "join group" request over websockets
    sendJoinGroup(group.id);
  }

  return (
    // Background
    <div className="bg-gradient-to-r from-indigo-800 to-blue-700 shadow-2xl w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col items-center justify-between h-[90%]">
        {/* Logo */}
        <Logo />

        {/* Content */}
        {groupData ? (
          <div className="w-[900px] flex items-center gap-10 mx-auto">
            {/* Group photo */}
            <div className="flex flex-col shrink-0">
              <img
                className="w-80 h-80 rounded-full object-cover shadow-2xl"
                src={`${import.meta.env.VITE_BACKEND_URL}/avatars/${
                  groupData.id
                }.jpeg?${Date.now()}`}
                alt=""
              />
            </div>

            {/* Group info */}
            <div className="text-white">
              {/* Group name */}
              <p className="font-light text-xl text-slate-300 pt-1">
                You have been invited to join
              </p>
              <h1 className="text-5xl font-semibold tracking-tight pt-2 pb-3">
                {groupData.name}
              </h1>

              {/* Creator handle, creation date */}
              <p className="text-slate-300 text-md">
                {groupData.isPublic ? "Public" : "Private"} Group •{" "}
                {groupData.members.length} Members • Created by{" "}
                <span className="text-white font-semibold">
                  @{groupData.creator?.handle}
                </span>{" "}
                on {formatDate(groupData.createdAt)}
              </p>

              {/* Group description */}
              <p className="text-xl pt-6 text-slate-100">
                {groupData.description}
              </p>
            </div>
          </div>
        ) : notFound ? (
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-white text-6xl font-semibold tracking-tight text-centers">
              404 • Not Found
            </h2>
            <p className="text-slate-200 text-xl text-center">
              Hmm, it looks like this invite isn't valid anymore. Sorry! 😕
            </p>
          </div>
        ) : (
          <p className="text-slate-100 text-2xl">Loading...</p>
        )}

        {/* Footer/CTA */}
        {groupData ? (
          <div className="mx-auto">
            {errorMsg ? (
              <div className="bg-red-500 font-semibold text-xl text-white px-8 py-3 rounded-full">
                {errorMsg}
              </div>
            ) : (
              <button
                className="bg-white font-semibold text-xl text-blue-700 px-8 py-3 rounded-full hover:brightness-90 transition-all"
                onClick={handleClick}
              >
                Join now
              </button>
            )}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

export default Invite;
