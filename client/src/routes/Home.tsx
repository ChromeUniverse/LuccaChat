import React from "react";

interface LoginButtonProps {
  provider: "google" | "github";
}

function LoginButton({ provider }: LoginButtonProps) {
  function clickHandler() {}

  let label = "";
  if (provider === "google") label = "Google";
  if (provider === "github") label = "GitHub";

  return (
    <a
      href={`http://localhost:8080/auth/${provider}`}
      className="bg-slate-500 px-2 py-2 rounded-full flex items-center justify-center outline-none hover:bg-opacity-50"
      onClick={clickHandler}
    >
      <p className="text-slate-100">Login with {label}</p>
    </a>
  );
}

function Home() {
  return (
    <div className="">
      {/* Title */}
      <h1 className="text-3xl">Welcome to LuccaChat</h1>
      {/* Login button container */}
      <div className="flex flex-col w-48">
        <LoginButton provider="google" />
        <LoginButton provider="github" />
      </div>
    </div>
  );
}

export default Home;
