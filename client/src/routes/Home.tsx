import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faCommentDots } from "@fortawesome/free-regular-svg-icons";
import { faAnglesDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MutableRefObject, useRef } from "react";
import { Links } from "../components/Home";

interface StyledIconProps {
  src: string;
  href: string;
  rounded?: boolean;
}

function StyledIcon({ src, href, rounded = false }: StyledIconProps) {
  console.log(`${src} is rounded: ${rounded}`);

  return (
    <a href={href} className="bg-transparent flex items-center justify-center">
      <img
        className={`
          w-24 hover:brightness-110 shadow-2xl hover:scale-110 transition-all
          ${rounded ? "rounded-full" : ""}
        `}
        src={src}
        alt=""
      />
    </a>
  );
}

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
      className="bg-white border-blue-700 border-2 px-8 py-3 rounded-full flex items-center justify-center gap-4 outline-none hover:brightness-90 shadow-2xl transition-all"
      onClick={clickHandler}
    >
      <FontAwesomeIcon
        className="text-2xl text-blue-800 inline pb-0"
        icon={brandInfo[provider].icon}
      />
      <p className="text-slate-700 text-xl">
        Login with{" "}
        <span className="font-semibold text-blue-800">
          {brandInfo[provider].label}
        </span>
      </p>
    </a>
  );
}

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

function Title() {
  return (
    <div className="flex gap-4">
      <h1 className="text-6xl text-white font-light">
        Welcome to <span className="font-semibold">LuccaChat</span>
      </h1>
      <FontAwesomeIcon
        className="text-6xl text-white inline"
        icon={faCommentDots}
      />
    </div>
  );
}

interface HeroProps {
  scroll: () => void;
}

function Hero({ scroll }: HeroProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-800 to-blue-700 h-screen relative overflow-y-hidden flex flex-col items-center max-h-[900px]">
      {/* <div className="w-[1100px] flex justify-between items-center"> */}
      {/* Title */}
      <div className="pt-16 flex flex-col items-center">
        <Title />
        <p className="mt-6 text-xl text-slate-300 text-center">
          A full-stack live chat app built by{" "}
          <span className="font-semibold text-white">Lucca Rodrigues</span>.
        </p>
      </div>

      {/* CTA button */}
      <div className="mt-12">
        <button
          className="bg-white text-blue-900 text-xl font-semibold px-7 py-2 rounded-full shadow-md hover:brightness-90 transition-all outline-none"
          onClick={() => scroll()}
        >
          Join now!
        </button>
      </div>

      {/* App screenshot preview */}
      <div className="mt-20 flex w-full justify-center">
        <img
          className="w-[70%] rounded-2xl shadow-2xl"
          src="/preview-violet.png"
          alt=""
        />
      </div>
    </div>
  );
}

function Technologies() {
  return (
    <div className="pt-32 pb-40 bg-zinc-900">
      <div className="mx-auto w-[80%]">
        {/* Title */}
        <h2 className="text-slate-200 font-semibold text-center text-5xl mt-0 tracking-tight">
          Powered by{" "}
          <span className="font-bold bg-gradient-to-r from-sky-400 to-violet-500 text-transparent bg-clip-text">
            awesome
          </span>{" "}
          open-source tech
        </h2>

        <div className="mt-28 gap-10 grid grid-cols-8 w-[1000px] max-w-full mx-auto">
          {/* Icons */}
          <div className="tech-grid-1 grid grid-cols-4 grid-rows-2 gap-y-8">
            <StyledIcon
              src="typescript.png"
              href="https://www.typescriptlang.org/"
            />
            <StyledIcon src="vite.svg" href="https://vitejs.dev/" />
            <StyledIcon src="react.png" href="https://reactjs.org/" />
            <StyledIcon src="zod.svg" href="https://zod.dev/" />
            {/* <StyledIcon src="express.png" href="https://zod.dev/" /> */}
            <StyledIcon src="node.png" href="https://nodejs.org/en/" />
            <StyledIcon src="tailwindcss.svg" href="https://tailwindcss.com/" />
            <StyledIcon src="prisma.jpg" href="https://prisma.io" rounded />
            <StyledIcon
              src="postgresql.png"
              href="https://www.postgresql.org/"
            />
          </div>

          {/* Text */}
          <p className="tech-grid-2 text-slate-300 text-2xl leading-normal">
            LuccaChat's tech stack relies on a robust, yet cutting edge suite of
            modern programming languages, frameworks and tooling.
          </p>
        </div>
      </div>
    </div>
  );
}

interface CTAProps {
  ctaRef: MutableRefObject<null>;
}

function CTA({ ctaRef }: CTAProps) {
  return (
    <div ref={ctaRef} className="bg-gradient-to-r from-indigo-800 to-blue-700">
      <div className="pt-36 pb-48 flex flex-col w-[800px] mx-auto">
        {/* Title */}
        <h2 className="text-white font-semibold text-center text-5xl mt-0 tracking-tight">
          Ready to join?
        </h2>

        <p className="text-center text-slate-300 text-xl pt-4 pb-20">
          Login Powered by OAuth2
        </p>

        {/* Login buttons */}
        <div className="w-96 mx-auto space-y-3">
          <LoginButton provider="google" />
          <LoginButton provider="github" />
        </div>
      </div>
    </div>
  );
}

function Footer() {
  // bg-gradient-to-r from-indigo-800 to-blue-700
  return (
    <div className="h-32 bg-zinc-900">
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

function Home() {
  const ctaRef = useRef(null);

  const scroll = () =>
    (ctaRef.current as any).scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

  return (
    <>
      <Hero scroll={scroll} />
      <Technologies />
      <CTA ctaRef={ctaRef} />
      <Footer />
    </>
  );
}

export default Home;
