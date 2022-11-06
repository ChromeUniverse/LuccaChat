import create from "zustand";

export type ModalState = null | 'add-chat' | 'add-friend' | 'create-group' | 'browse-groups';

interface State {
  modalState: ModalState,
  setModalState: (newModalState: ModalState) => void
}

export const useModalStore = create<State>((set) => ({
  modalState: "add-friend",
  setModalState: (newModalState) => set((state) => ({ ...state, modalState: newModalState })),
}));
