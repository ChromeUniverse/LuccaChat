import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faCommentDots } from "@fortawesome/free-regular-svg-icons";
import { faAnglesDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface LoginButtonProps {
  provider: "google" | "github";
}

function LoginButton({ provider }: LoginButtonProps) {
  function clickHandler() {}

  const brandInfo = {
    google: {
      label: "Google",
      icon: faGoogle,
    },
    github: {
      label: "GitHub",
      icon: faGithub,
    },
  };

  return (
    <a
      href={`http://localhost:8080/auth/${provider}`}
      className="bg-transparent border-blue-700 border-2 px-8 py-2 rounded-full flex items-center justify-center gap-3 outline-none hover:bg-opacity-50"
      onClick={clickHandler}
    >
      <FontAwesomeIcon
        className="text-lg text-blue-800 inline pb-0"
        icon={brandInfo[provider].icon}
      />
      <p className="text-slate-700">
        Login with{" "}
        <span className="font-semibold text-blue-800">
          {brandInfo[provider].label}
        </span>
      </p>
    </a>
  );
}

function Title() {
  return (
    <div className="flex gap-4">
      <h1 className="text-5xl text-white font-light">
        Welcome to <span className="font-semibold">LuccaChat</span>
      </h1>
      <FontAwesomeIcon
        className="text-5xl text-white inline"
        icon={faCommentDots}
      />
    </div>
  );
}

function Hero() {
  return (
    <div className="bg-gradient-to-r from-indigo-800 to-blue-700 h-screen flex justify-center items-center relative">
      <div className="w-[1100px] flex justify-between items-center">
        {/* Title */}
        <div className="">
          <Title />
          <p className="mt-6 text-lg text-slate-400 text-center">
            A full-stack chat app built by{" "}
            <span className="font-semibold text-white">Lucca Rodrigues</span>.
          </p>
        </div>
        {/* CTA container */}
        <div className="flex flex-col w-80 bg-white rounded-xl px-10 py-10 items-center">
          {/* CTA title */}
          <p className="font-semibold text-2xl">Join today!</p>
          {/* Login buttons container  */}
          <div className="flex flex-col items-center gap-4 pt-8">
            <LoginButton provider="google" />
            <LoginButton provider="github" />
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-0 w-full flex justify-center items-center gap-3">
          <FontAwesomeIcon
            className="text-lg text-white inline"
            icon={faAnglesDown}
          />
          <p className="text-white text-xl">Scroll for more info!</p>
        </div>
      </div>
    </div>
  );
}

function Screen1() {
  return (
    <div className="h-screen bg-slate-900">
      <div className="pt-10 w-[1100px] mx-auto">
        <h2 className="text-white text-3xl">What is LuccaChat?</h2>
      </div>
    </div>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <Screen1 />
    </>
  );
}

export default Home;
