import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faGlobe, faHandsBubbles } from "@fortawesome/free-solid-svg-icons";
import { faCommentDots } from "@fortawesome/free-regular-svg-icons";

type Props = {};

function Footer() {
  return (
    <footer className="flex flex-col gap-3 pt-12">
      <p className="dark:text-white text-center text-xl">
        Built by <span className="font-bold text-sky-600">Lucca Rodrigues</span> 🚀
      </p>
      <div className="flex flex-row justify-center gap-3">
        <a
          className="hover:scale-125 transition-all text-sky-600"
          href="https://github.com/ChromeUniverse"
        >
          <FontAwesomeIcon icon={faGithub} size="xl" />
        </a>
        <a
          className="hover:scale-125 transition-all text-sky-600"
          href="http://34.200.98.64/"
        >
          <FontAwesomeIcon icon={faGlobe} size="xl" />
        </a>
        <a
          className="hover:scale-125 transition-all text-sky-600"
          href="https://www.youtube.com/c/LuccasLab"
        >
          <FontAwesomeIcon icon={faYoutube} size="xl" />
        </a>
      </div>
    </footer>
  );
}

function Home({}: Props) {
  return (
    <div className="bg-slate-200 w-full h-full flex flex-col items-center justify-center">
      {/* Home view header */}
      <header className="flex gap-3">
        <h1 className="text-5xl">
          Welcome to <span className="font-bold text-sky-600">LuccaChat</span>
        </h1>
        <FontAwesomeIcon className="text-5xl text-sky-600" icon={faCommentDots} />
      </header>

      <p className="text-xl mt-2">(Possibly) the world's greatest chat app!</p>

      {/* Features List */}
      <ul className="list-disc space-y-3 mt-24 mb-12 marker:text-sky-600">
        <li className="text-xl">Select chats from the sidebar</li>
        <li className="text-xl">
          Don't have any chats yet? Click <span className="font-bold text-sky-600">Add Chat</span>!
        </li>
        <li className="text-xl">
          We support <span className="font-bold text-sky-600">DMs</span>,{" "}
          <span className="font-bold text-sky-600">private</span> and{" "}
          <span className="font-bold text-sky-600">public groups</span>!
        </li>
        <li className="text-xl">We pinky swear to not spy on your data, lmao 🤣</li>
      </ul>

      {/* Home view footer */}
      <Footer />
    </div>
  );
}

export default Home;
