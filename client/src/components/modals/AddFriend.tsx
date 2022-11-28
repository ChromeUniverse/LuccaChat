import React, { useEffect, useState } from "react";

// Font Awesome
import {
  faAngleRight,
  faArrowLeft,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Zustand
import { useModalStore } from "../../zustand/modals-store";
import useWebSockets from "../../hooks/useWebSockets";
import { emitter } from "../../routes/App";

function AddFriend() {
  const setModalState = useModalStore((state) => state.setModalState);
  const { sendRequest } = useWebSockets();

  const [input, setInput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [sent, setSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.currentTarget.value);
  }

  function handleClick() {
    if (sent) return;
    if (input === "") return setPrompt("That can't be empty, dummy");
    // console.log(input);
    else sendRequest(input.toString());
  }

  useEffect(() => {
    const ackHandler = () => {
      setPrompt("Request sent! Now you wait. :-)");
      setSent(true);
      setTimeout(() => {
        setModalState(null);
      }, 2000);
    };

    const errorHandler = (errorMessage: string) => {
      setPrompt(errorMessage);
    };

    emitter.on("ackRequest", ackHandler);
    emitter.on("errorRequest", errorHandler);

    return () => {
      emitter.off("ackRequest", ackHandler);
      emitter.off("errorRequest", errorHandler);
    };
  }, []);

  return (
    <div className="pl-12 pr-24 pt-8 pb-20 bg-slate-300 bg-opacity-100 z-20 rounded-xl flex items-start">
      {/* Back button */}
      <FontAwesomeIcon
        className="cursor-pointer py-[6px] pr-6"
        icon={faArrowLeft}
        size="lg"
        onClick={() => setModalState("add-chat")}
      />

      {/* Modal content */}

      <div className="flex flex-col grow">
        {/* Modal header */}
        <h2 className="py-0 text-2xl font-semibold">Add friend</h2>

        {/* Modal description */}
        <p className="font-light pt-3">
          This will send a chat request to your friend.
          <br />
          You can start chatting once they accept the request.
        </p>

        {/* Input container */}

        <p className="pt-6 text-lg">Handle</p>

        <div className="w-full pl-4 mt-2 bg-slate-200 rounded-full flex items-center">
          {/* "@"" handle prefix */}
          <p
            className={`-mt-[2px] mr-1.5 text-slate-400 ${
              sent ? "text-slate-400" : ""
            }`}
          >
            @
          </p>

          {/* handle input */}
          <input
            className={`
              w-full py-3 bg-transparent outline-none placeholder:text-slate-400
              ${sent ? "text-slate-400" : ""}
            `}
            placeholder="my_awesome_handle"
            disabled={sent}
            type="text"
            value={input}
            onChange={handleChange}
          />

          {/* Button */}
          <div
            className={`
              bg-slate-400 w-14 h-14 rounded-full flex-shrink-0 ml-2 flex items-center justify-center
              ${sent ? "cursor-default" : "cursor-pointer hover:bg-opacity-50"}
            `}
            onClick={handleClick}
          >
            <FontAwesomeIcon
              className="text-slate-200"
              icon={sent ? faCheck : faAngleRight}
              size="lg"
            />
          </div>
        </div>

        {/* Error prompt */}
        <p className="mt-3 italic text-sm text-slate-600">{prompt}</p>
      </div>
    </div>
  );
}

export default AddFriend;
