import create from "zustand";
import avatar from "../assets/avatar.jpeg";
import { devtools } from "zustand/middleware";
import { RequestType, UserType } from "../data";
import { requestSchemaType } from "../zod/api-requests";
import { user1 } from "./chats-store";

interface State {
  requests: RequestType[];
  addRequest: (data: requestSchemaType) => void;
  removeRequest: (requestId: string) => void;
}

export const useRequestsStore = create<State>()(
  devtools(
    (set, get) => ({
      requests: [],

      addRequest: (data) => {
        if (get().requests.findIndex((r) => r.id === data.id) !== -1) return;

        const newReq: RequestType = {
          id: data.id,
          sentAt: data.createdAt,
          sender: { ...data.sender, pfp_url: avatar },
        };

        set((state) => ({
          ...state,
          requests: [...get().requests, newReq],
        }));
      },

      removeRequest: (requestId) => {
        set((state) => ({
          ...state,
          requests: get().requests.filter((r) => r.id !== requestId),
        }));
      },
    }),
    {
      name: "requests-store",
    }
  )
);
