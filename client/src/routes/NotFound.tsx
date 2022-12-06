import { faCommentDots } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";

type Props = {};

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

function Footer() {
  // bg-gradient-to-r from-indigo-800 to-blue-700
  return (
    <div className="h-32 bg-zinc-900 w-full">
      <div className="w-[80%] mx-auto flex items-center justify-between h-full">
        {/* LuccaChat Logo */}
        <Logo />
        {/* Attribution */}
        <div className="flex items-center gap-4">
          <p className="text-xl text-slate-300">
            Built with 💙 by{" "}
            <a
              href="https://github.com/ChromeUniverse/"
              className="text-white font-bold hover:underline hover:decoration-blue-600 hover:decoration-2"
            >
              Lucca Rodrigues
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function NotFound({}: Props) {
  return (
    <div className="bg-gradient-to-r from-indigo-800 to-blue-700 shadow-2xl w-screen h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center h-[90%]">
        <Logo />
        <div className="flex flex-col items-center gap-5 h-full justify-center">
          <h2 className="text-white text-6xl font-semibold tracking-tight text-centers">
            404 • Not Found
          </h2>
          <p className="text-slate-200 text-xl text-center">
            We couldn't find what you were looking for. Sorry! 😕
          </p>
          <Link
            className="mt-4 bg-white text-blue-900 text-xl font-semibold px-7 py-2 rounded-full shadow-md hover:brightness-90 transition-all outline-none"
            to="/"
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
