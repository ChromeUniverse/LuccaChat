import React from "react";

// NOTE: this component just forces Tailwind to load
// the appropriate CSS classes for the accent colors
// ...
// Please ignore any and all errors/warning thrown by
// Tailwind CSS's intellisense

export default function Colors() {
  return (
    <div
      className={`
      bg-blue-500 bg-blue-400 bg-blue-300 text-blue-500 group-hover:bg-blue-400 hover:bg-blue-400 bg-blue-600 marker:text-blue-500
      bg-pink-500 bg-pink-400 bg-pink-300 text-pink-500 group-hover:bg-pink-400 hover:bg-pink-400 bg-pink-600 marker:text-pink-500
      bg-green-500 bg-green-400 bg-green-300 text-green-500 group-hover:bg-green-400 hover:bg-green-400 bg-green-600 marker:text-green-500
      bg-orange-500 bg-orange-400 bg-orange-300 text-orange-500 group-hover:bg-orange-400 hover:bg-orange-400 bg-orange-600 marker:text-orange-500
      bg-violet-500 bg-violet-400 bg-violet-300 text-violet-500 group-hover:bg-violet-400 hover:bg-violet-400 bg-violet-600 marker:text-violet-500
    `}
    ></div>
  );
}
