import React, { useState } from "react";
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
import { useChatsStore, user } from "../../zustand/chats-store";
import { faClipboard } from "@fortawesome/free-regular-svg-icons";
import { GroupType } from "../../data";
import { useDebouncedCallback } from "use-debounce";

interface FormLineProps {
  label: string;
  placeholder?: string;
  value?: any;
  setter?: (...args: any) => any;
  handle?: boolean;
  password?: boolean;
  errorPrompt?: string;
}

function FormLine({
  label,
  placeholder = "",
  value = null,
  setter = () => {},
  handle = false,
  password = false,
  errorPrompt = '',
}: FormLineProps) {
  return (
    <div className="mb-4">
      
      {/* Label text */}
      <p className="pb-2">{label}</p>

      {password ? (
        // Change password button
        <button className="text-slate-100 w-full font-semibold rounded-full bg-slate-400 text-lg py-2 hover:bg-opacity-50">
          Change password
        </button>
      ) : (
        // Input container
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
      )}

      {/* Error text prompt */}
      {errorPrompt !== '' && <p className="mt-2 text-sm italic text-slate-500">{errorPrompt}</p>}
    </div>
  );
}

type Props = {};

function AccountSettings({}: Props) {
  // form data
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [email, setEmail] = useState(user.email);

  // prompts
  const [nameError, setNameError] = useState("");
  const [handleError, setHandleError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [updatePrompt, setUpdatePrompt] = useState("");

  const setModalState = useModalStore((state) => state.setModalState);
  
  const debouncedClearUpdatePrompt = useDebouncedCallback(() => setUpdatePrompt(""), 1000);

  // form validation
  function handleUpdateClick() {

    let error = false;

    // Check for empty fields
    if (name === '') {
      error = true
      setNameError("This can't be empty");
    } else {
      setNameError("");
    }
    
    if (handle === '') {
      error = true
      setHandleError("This can't be empty");
    } else {
      setHandleError('');
    }

    if (email === '') {
      error = true
      setEmailError("This can't be empty");
    } else {
      setEmailError('');
    }

    // Check for available handle
    if (handle === 'lucca') {
      error = true
      setHandleError("This handle is already taken. Please try again");
    } else {
      setHandleError('');
    }

    // Check for valid email
    // NOTE: TODO!!!!
    if (email === '') {
      error = true
      setEmailError("Please enter a valid email");
    } else {
      setEmailError('');
    }

    // Dismiss if there are any errors
    if (error) return;
    setUpdatePrompt('Updated!');
    debouncedClearUpdatePrompt();
  }

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

      {/* Modal content */}
      <div className="flex mt-4 gap-10">
        {/* Upload picture */}
        <div className="flex flex-col w-60 justify-center">
          {/* Group picture */}
          <img className="rounded-full w-full" src={avatar} alt="" />

          {/* Upload button */}
          <button className="bg-slate-400 hover:bg-opacity-50 mt-6 w-full rounded-full font-semibold text-slate-100 text-lg py-2 outline-none">
            Upload photo
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col w-80">
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
          <FormLine
            label="Email"
            placeholder="chatty@chatface.com"
            value={email}            
            setter={setEmail}
            errorPrompt={emailError}
          />
          <FormLine label="Password" password />
        </div>
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
