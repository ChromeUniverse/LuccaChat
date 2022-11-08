import create from "zustand";
import { devtools } from "zustand/middleware";
import { UserType } from "../data";
import { user1 } from "./chats-store";

export interface RequestType {
  id: string;
  sender: UserType;
  sentAt: Date;
}


const request1 = {
  id: '0',
  sender: user1,
  sentAt: new Date(),
}


interface State {
  requests: RequestType[];
  removeRequest: (requestId: string) => void;
}

export const useRequestsStore = create<State>()(
  devtools((set, get) => ({    
    requests: [request1],
    removeRequest: (requestId) => {
      const requests = get().requests;
      set((state) => ({ ...state, requests: requests.filter((r) => r.id !== requestId) }));
    }
  }), {
    name: 'requests-store'
  })
);
