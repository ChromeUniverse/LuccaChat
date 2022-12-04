import create from "zustand";
import avatar from "../assets/avatar.jpeg";
import { devtools } from "zustand/middleware";
import { CurrentUserType } from "../data";

interface State {
  user: CurrentUserType;
  lastImageUpdate: Date;
  userInfoInit: (id: string, name: string, handle: string) => void;
  updateInfo: (name: string, handle: string) => void;
  resetLastImageUpdate: () => void;
}

export const useUserStore = create<State>()(
  devtools(
    (set, get) => ({
      // set user profile info
      user: {
        id: "",
        name: "",
        handle: "",
        accentColor: "blue",
      },

      lastImageUpdate: new Date(),

      userInfoInit: (id: string, name: string, handle: string) => {
        set((state) => ({ user: { ...state.user, id, name, handle } }));
      },

      // updatess user profile info
      updateInfo: (name: string, handle: string) => {
        set((state) => ({
          user: { ...state.user, name, handle },
        }));
      },

      resetLastImageUpdate: () => {
        set((state) => ({ ...state, lastImageUpdate: new Date() }));
      },
    }),
    {
      name: "requests-store",
    }
  )
);
