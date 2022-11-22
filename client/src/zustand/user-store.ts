import create from "zustand";
import avatar from "../assets/avatar.jpeg";
import { devtools } from "zustand/middleware";
import { CurrentUserType } from "../data";

interface State {
  user: CurrentUserType;
  userInfoInit: (
    id: string,
    name: string,
    handle: string,
    email: string
  ) => void;
  updateInfo: (name: string, handle: string, email: string) => void;
}

export const useUserStore = create<State>()(
  devtools(
    (set, get) => ({
      // set user profile info
      user: {
        id: "",
        name: "",
        handle: "",
        email: "",
        pfp_url: avatar,
      },
      userInfoInit: (
        id: string,
        name: string,
        handle: string,
        email: string
      ) => {
        set((state) => ({ user: { ...state.user, id, name, handle, email } }));
      },

      // updatess user profile info
      updateInfo: (name: string, handle: string, email: string) => {
        set((state) => ({
          user: { ...state.user, name, handle, email },
        }));
      },
    }),
    {
      name: "requests-store",
    }
  )
);
