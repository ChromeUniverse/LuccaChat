import create from "zustand";
import avatar from "../assets/avatar.jpeg";
import { devtools } from "zustand/middleware";
import { RequestType, UserType } from "../data";
import { requestSchema } from "../../../server/src/zod/api-requests";
import { z } from "zod";

interface State {
  requests: RequestType[];
  addRequest: (data: z.infer<typeof requestSchema>) => void;
  removeRequest: (requestId: string) => void;
  updateUserInfoInRequests: (
    userId: string,
    name: string,
    handle: string
  ) => void;
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

      updateUserInfoInRequests: (userId, name, handle) => {
        set((state) => ({
          ...state,
          requests: get().requests.map((r) =>
            r.sender.id === userId
              ? { ...r, sender: { ...r.sender, name: name, handle: handle } }
              : r
          ),
        }));
      },
    }),
    {
      name: "requests-store",
    }
  )
);
