import React, { useEffect, useState } from "react";
import avatar from "../../assets/avatar.jpeg";

// Font Awesome
import {
  faAngleRight,
  faArrowLeft,
  faRotateRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Zustand
import { useModalStore } from "../../zustand/modals-store";
import { useDebouncedCallback } from "use-debounce";
import { useUserStore } from "../../zustand/user-store";
import { emitter } from "../../routes/App";
import useWebSockets from "../../hooks/useWebSockets";
import { z } from "zod";
import { errorUserInfoSchema } from "../../../../server/src/zod/schemas";

interface FormLineProps {
  label: string;
  placeholder?: string;
  value?: any;
  setter?: (...args: any) => any;
  handle?: boolean;
  errorPrompt?: string;
}

function FormLine({
  label,
  placeholder = "",
  value = null,
  setter = () => {},
  handle = false,
  errorPrompt = "",
}: FormLineProps) {
  return (
    <div className="mb-4">
      {/* Label text */}
      {/* <p className="pb-2">{label}</p> */}
      <label className="pb-2" htmlFor={label}>
        {label}
      </label>

      {/* Input container */}
      <div className="py-3 px-5 bg-slate-200 rounded-xl flex gap-1">
        {handle && <span className="text-slate-400">@</span>}
        <input
          className="w-full bg-transparent outline-none"
          placeholder={placeholder}
          type="text"
          value={value}
          onInput={(e) => setter(e.currentTarget.value)}
        />
      </div>

      {/* Error text prompt */}
      {errorPrompt !== "" && (
        <p className="mt-2 text-sm italic text-slate-500">{errorPrompt}</p>
      )}
    </div>
  );
}

type Props = {};

function AccountSettings({}: Props) {
  const user = useUserStore((state) => state.user);

  // form data
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);

  // prompts
  const [nameError, setNameError] = useState("");
  const [handleError, setHandleError] = useState("");
  const [updatePrompt, setUpdatePrompt] = useState("");

  const setModalState = useModalStore((state) => state.setModalState);

  const { sendUpdateUserSettings } = useWebSockets();

  const debouncedClearUpdatePrompt = useDebouncedCallback(
    () => setUpdatePrompt(""),
    1000
  );

  // form validation
  function handleUpdateClick() {
    sendUpdateUserSettings(name, handle);
  }

  useEffect(() => {
    const userUpdatedHandler = () => {
      setNameError("");
      setHandleError("");
      setUpdatePrompt("Updated!");
      debouncedClearUpdatePrompt();
    };

    const userUpdateErrorHandler = (
      errorData: z.infer<typeof errorUserInfoSchema>
    ) => {
      console.log("error fired!!!", errorData);

      setNameError(errorData.nameError);
      setHandleError(errorData.handleError);
    };

    emitter.on("userUpdated", userUpdatedHandler);
    emitter.on("userUpdateError", userUpdateErrorHandler);

    return () => {
      emitter.off("userUpdated", userUpdatedHandler);
      emitter.off("userUpdateError", userUpdateErrorHandler);
    };
  }, []);

  return (
    <div className="px-16 pt-6 pb-12 bg-slate-300 bg-opacity-100 z-30 rounded-xl flex flex-col">
      {/* Modal header */}
      <div className="flex flex-row w-full items-center">
        <h2 className="py-3 text-2xl font-semibold mr-auto">
          Account settings
        </h2>
        <FontAwesomeIcon
          className="cursor-pointer"
          icon={faXmark}
          size="lg"
          onClick={() => setModalState(null)}
        />
      </div>

      {/* <p className="text-sm mt-3 mb-3">
        <span className="font-semibold">Note:</span> updated names/handles only
        appear to other users once they refresh the app.
      </p> */}

      {/* Modal content */}
      <div className="flex mt-4 gap-10">
        {/* Upload picture */}

        <div className="w-60">
          <form action="flex flex-col justify-center">
            {/* Group picture */}
            <img className="rounded-full w-full" src={avatar} alt="" />

            {/* Upload button */}
            <div className="">
              <label
                className="bg-slate-400 hover:bg-opacity-50 mt-6 w-full rounded-full font-semibold text-slate-100 text-lg py-2 outline-none cursor-pointer block text-center"
                htmlFor="pfp_upload"
              >
                Choose photo
              </label>
              <input
                id="pfp_upload"
                name="pfp_upload"
                className="hidden"
                type="file"
                accept="image/png, image/jpeg"
              />
            </div>
          </form>
        </div>

        {/* Form */}
        <form action="" className="mt-8">
          <FormLine
            label="Display name"
            placeholder="Chatty McChatface"
            value={name}
            setter={setName}
            errorPrompt={nameError}
          />
          <FormLine
            label="Handle"
            placeholder="chatty"
            value={handle}
            setter={setHandle}
            errorPrompt={handleError}
            handle
          />
        </form>
      </div>

      {/* Modal footer */}
      <div className="flex w-full pt-6 items-center gap-6">
        {/* Update Prompt */}
        <p className="ml-auto">{updatePrompt}</p>

        {/* Update Button */}
        <div
          className="bg-slate-400 px-6 h-14 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center hover:bg-opacity-50"
          onClick={handleUpdateClick}
        >
          <p className="font-semibold text-slate-200 text-lg mr-3">Update</p>
          <FontAwesomeIcon
            className="text-slate-200"
            icon={faAngleRight}
            size="lg"
          />
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
