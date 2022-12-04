import React, { useEffect, useState } from "react";

// Font Awesome
import {
  faAngleRight,
  faCheck,
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
import { usePreferenceStore } from "../../zustand/userPreferences";
import { colorType } from "../../data";

type ColorButtonProps = {
  color: colorType;
  check: boolean;
  setColor: (color: colorType) => void;
};

export const ColorButton = ({ color, check, setColor }: ColorButtonProps) => {
  return (
    <div
      className={`
        group h-10 w-10 rounded-full cursor-pointer hover:bg-${color}-400 bg-${color}-500 flex items-center justify-center
        ${check ? `bg-${color}-400` : ""}
      `}
      onClick={() => setColor(color)}
    >
      {check && (
        <FontAwesomeIcon className="text-xl text-white" icon={faCheck} />
      )}
    </div>
  );
};

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
      <label
        className="font-semibold text-md dark:text-slate-300"
        htmlFor={label}
      >
        {label}
      </label>

      {/* Input container */}
      <div className="mt-1 py-3 px-5 bg-slate-200 dark:bg-slate-800 rounded-xl flex w-64 items-center">
        {handle && <span className="text-slate-400 mr-1">@</span>}
        <input
          id={label}
          className="w-full bg-transparent outline-none text-lg"
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
  const lastImageUpdate = useUserStore((state) => state.lastImageUpdate);
  const defaultSrc = `${import.meta.env.VITE_BACKEND_URL}/avatars/${
    user.id
  }.jpeg?${lastImageUpdate.getTime()}`;

  const accentColor = usePreferenceStore((state) => state.accentColor);
  // const setAccentColor = usePreferenceStore((state) => state.setAccentColor);
  const colors: colorType[] = ["blue", "pink", "green", "orange", "violet"];

  // form data
  const [imgDataURL, setImgDataURL] = useState("");
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [formColor, setFormColor] = useState(accentColor);

  // prompts
  const [imgError, setImgError] = useState("");
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
    if (imgError !== "") return;
    sendUpdateUserSettings(name, handle, imgDataURL, formColor);
  }

  function handleImageFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    // Get the file
    const files = e.target.files;
    if (!files) return console.log("No files!");
    const file = files[0];
    console.log("Got file", file.name);

    // Check if file size exceeds limit
    if (file.size > 500000) {
      return setImgError("Profile image can't exceed 500kB");
    } else {
      setImgError("");
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      console.log(reader.result);
      setImgDataURL(reader.result as string);
    });

    reader.readAsDataURL(file);
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
    <div className="px-16 pt-6 pb-12 bg-slate-300 dark:bg-slate-700 bg-opacity-100 z-30 rounded-xl flex flex-col">
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

      {/* Modal content */}
      <div className="flex mt-4 gap-10">
        {/* Profile picture */}
        <div className="w-60 self-center">
          {/* Current image OR selected image preview */}
          <img
            className="rounded-full w-60 h-60 object-cover"
            src={imgDataURL === "" ? defaultSrc : imgDataURL}
            alt="lmao"
          />
          {/* Error prompt */}
          <p className="w-full text-center italic text-sm pt-4">{imgError}</p>
        </div>

        <div className="flex flex-col">
          {/* Form */}
          <form action="" className="mt-0">
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
          {/* Accent color selector */}
          <div className="flex flex-col justify-between gap-3">
            <p className="font-semibold text-md dark:text-slate-300">
              Accent color
            </p>
            {/* Color selectors container */}
            <div className="flex justify-between px-1">
              {colors.map((color, index) => (
                <ColorButton
                  key={index}
                  color={color}
                  check={color === formColor}
                  setColor={setFormColor}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal footer */}
      <div className="flex w-full pt-10 items-center">
        {/* Upload button */}
        <div className="">
          <label
            className="bg-slate-400 dark:bg-slate-800 hover:bg-opacity-50 dark:hover:bg-opacity-50 py-3 w-60 rounded-full font-semibold text-slate-100 text-lg outline-none cursor-pointer block text-center"
            htmlFor="pfp_upload"
          >
            Choose photo
          </label>
          <input
            id="pfp_upload"
            name="pfp_upload"
            className="hidden"
            type="file"
            accept="image/jpeg"
            onChange={handleImageFileSelect}
          />
        </div>

        {/* Update Prompt */}
        <p className="ml-auto mr-4">{updatePrompt}</p>

        {/* Update Button */}
        <div
          className={`bg-${accentColor}-500 px-6 h-14 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center hover:bg-${accentColor}-400`}
          onClick={handleUpdateClick}
        >
          <p className="font-semibold text-slate-100 text-lg mr-3">Update</p>
          <FontAwesomeIcon
            className="text-slate-100"
            icon={faAngleRight}
            size="lg"
          />
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
