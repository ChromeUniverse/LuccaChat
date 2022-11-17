import create from "zustand";
import { GroupType, UserType } from "../data";

interface State {
  infoOpen: "user" | "group" | null;
  data: UserType | GroupType | null;
  showGroupInfo: (group: GroupType) => void;
  showUserInfo: (user: UserType) => void;
  closeInfo: () => void;
}

export const useInfoStore = create<State>((set) => ({
  infoOpen: null,
  data: null,
  showGroupInfo: (group) => set((state) => ({ ...state, infoOpen: "group", data: group })),
  showUserInfo: (user) => set((state) => ({ ...state, infoOpen: "user", data: user })),
  closeInfo: () => set((state) => ({ ...state, infoOpen: null, data: null })),
}));
