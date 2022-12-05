import create from "zustand";
import { devtools, persist } from "zustand/middleware";
import { colorType } from "../data";

// bg-blue-400
// bg-pink-400
// bg-green-400
// bg-orange-400
// bg-violet-400

interface State {
  darkMode: boolean;
  accentColor: colorType;
  toggleDarkMode: () => void;
  setAccentColor: (newColor: colorType) => void;
}

export const usePreferenceStore = create<State>()(
  devtools(
    persist(
      (set, get) => ({
        darkMode: true,
        accentColor: "blue",
        toggleDarkMode: () => {
          set((state) => ({ ...state, darkMode: !get().darkMode }));
        },
        setAccentColor: (newColor) => {
          set((state) => ({ ...state, accentColor: newColor }));
        },
      }),
      {
        name: "user-preference-store",
      }
    )
  )
);
