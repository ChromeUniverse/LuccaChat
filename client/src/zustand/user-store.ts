import create from "zustand";
import avatar from "../assets/avatar.jpeg";
import { devtools } from "zustand/middleware";
import { CurrentUserType } from "../data";

interface State {
  user: CurrentUserType;
  userInfoInit: (id: string, name: string, handle: string) => void;
  updateInfo: (name: string, handle: string) => void;
}

export const useUserStore = create<State>()(
  devtools(
    (set, get) => ({
      // set user profile info
      user: {
        id: "",
        name: "",
        handle: "",
        pfp_url: avatar,
      },
      userInfoInit: (id: string, name: string, handle: string) => {
        set((state) => ({ user: { ...state.user, id, name, handle } }));
      },

      // updatess user profile info
      updateInfo: (name: string, handle: string) => {
        set((state) => ({
          user: { ...state.user, name, handle },
        }));
      },
    }),
    {
      name: "requests-store",
    }
  )
);
