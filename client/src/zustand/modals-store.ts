import create from "zustand";
import { devtools } from "zustand/middleware";

export type ModalState =
  | null
  | "add-chat"
  | "add-friend"
  | "create-group"
  | "browse-groups"
  | "group-settings"
  | "leave-group"
  | "delete-group"
  | "account-settings"
  | "kick-member";

interface State {
  modalState: ModalState;
  setModalState: (newModalState: ModalState) => void;
}

export const useModalStore = create<State>()(
  devtools(
    (set) => ({
      modalState: null,
      setModalState: (newModalState) =>
        set((state) => ({ ...state, modalState: newModalState })),
    }),
    {
      name: "modal-store",
    }
  )
);
