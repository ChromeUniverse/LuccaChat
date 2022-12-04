import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faGlobe, faHandsBubbles } from "@fortawesome/free-solid-svg-icons";
import { faCommentDots } from "@fortawesome/free-regular-svg-icons";
import { usePreferenceStore } from "../zustand/userPreferences";
import { colorType } from "../data";

type Props = {};

function Footer({ accentColor }: { accentColor: colorType }) {
  return (
    <footer className="flex flex-col gap-3 pt-12">
      <p className="dark:text-white text-center text-xl">
        Built by{" "}
        <span className={`font-bold text-${accentColor}-500`}>
          Lucca Rodrigues
        </span>{" "}
        🚀
      </p>
      <div className="flex flex-row justify-center gap-3">
        <a
          className={`hover:scale-125 transition-all text-${accentColor}-500`}
          href="https://github.com/ChromeUniverse"
        >
          <FontAwesomeIcon icon={faGithub} size="xl" />
        </a>
        <a
          className={`hover:scale-125 transition-all text-${accentColor}-500`}
          href="http://34.200.98.64/"
        >
          <FontAwesomeIcon icon={faGlobe} size="xl" />
        </a>
        <a
          className={`hover:scale-125 transition-all text-${accentColor}-500`}
          href="https://www.youtube.com/c/LuccasLab"
        >
          <FontAwesomeIcon icon={faYoutube} size="xl" />
        </a>
      </div>
    </footer>
  );
}

function Home({}: Props) {
  const accentColor = usePreferenceStore((state) => state.accentColor);

  const randomMessages = [
    `(Possibly) the world's worst chat app!`,
    `Does anyone actually use this thing...?`,
    `Proudly built with over 100% COBOL! 👍`,
    `Over 0.00% uptime, guaranteed! 😉`,
    `"Discord?" What's that?`,
    `"Telegram"? Never heard of it! ¯\\_(ツ)_/¯`,
    `"WhatsApp?" As in "what's up"...? Oh, it's a chat app? Huh, never heard of it.`,
    `Don't expect VoIP to be added any time soon...!`,
    `Ya like jazz? 🎷🐛`,
    `Approved by "Robert'); DROP TABLE Students;--"!`,
  ];

  function getRandomMessage() {
    const randomIndex = Math.floor(Math.random() * randomMessages.length);
    // const randomIndex = 1;
    return randomMessages[randomIndex];
  }

  return (
    <div className="bg-slate-200 dark:bg-slate-800 w-full h-full flex flex-col items-center justify-center">
      {/* Home view header */}

      {/* <p className="text-3xl font-semibold">Welcome to</p> */}
      <header className="flex gap-4">
        <h1 className="text-5xl font-light">
          Welcome to{" "}
          <span className={`font-bold text-${accentColor}-500`}>LuccaChat</span>
        </h1>

        {/* <h1 className="text-6xl font-bold text-blue-400">LuccaChat</h1> */}

        <FontAwesomeIcon
          className={`text-5xl text-${accentColor}-500`}
          icon={faCommentDots}
        />
      </header>

      <p className="text-sm mt-4 dark:text-slate-400">{getRandomMessage()}</p>

      {/* Features List */}
      <ul
        className={`list-disc dark:text-slate-200 space-y-3 mt-24 mb-12 marker:text-${accentColor}-500`}
      >
        <li className="text-xl">Select chats from the sidebar</li>
        <li className="text-xl">
          Don't have any chats yet? Click{" "}
          <span className={`font-bold text-${accentColor}-500`}>Add Chat</span>!
        </li>
        <li className="text-xl">
          We support{" "}
          <span className={`font-bold text-${accentColor}-500`}>DMs</span>,{" "}
          <span className={`font-bold text-${accentColor}-500`}>private</span>{" "}
          and{" "}
          <span className={`font-bold text-${accentColor}-500`}>
            public groups
          </span>
          !
        </li>
        <li className="text-xl">
          We pinky swear to not spy on your data, lmao 🤣
        </li>
      </ul>

      {/* Home view footer */}
      <Footer accentColor={accentColor} />
    </div>
  );
}

export default Home;
