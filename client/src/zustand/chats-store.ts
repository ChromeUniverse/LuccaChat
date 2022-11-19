import create from "zustand";
import avatar from "../assets/avatar.jpeg";
import creeper from "../assets/creeper.webp";
import { devtools } from "zustand/middleware";
import { nanoid } from "nanoid";
import {
  ChatType,
  CurrentUserType,
  DMType,
  GroupType,
  MessageType,
  UserType,
} from "../data";
import {
  ChatSchemaType,
  UserSchemaType,
} from "../../../server/src/zod/api-chats";
import { messageSchemaType } from "../zod/api-messages";
// import { ChatSchemaType, UserSchemaType } from "../zod/schemas";

// example Users

// authed user:
export const user: CurrentUserType = {
  id: "19c5cede-a9ae-4479-81c2-95dc9c0a0e37",
  pfp_url: avatar,
  name: "Lucca Rodrigues",
  handle: "lucca",
  email: "lucca@gmail.com",
};

export const user1: UserType = {
  id: "1",
  pfp_url: avatar,
  name: "User 1",
  handle: "user1",
};

const user2: UserType = {
  id: "2",
  pfp_url: avatar,
  name: "User 2",
  handle: "user2",
};

const user3: UserType = {
  id: "3",
  pfp_url: avatar,
  name: "User 3",
  handle: "user3",
};

const user4: UserType = {
  id: "4",
  pfp_url: avatar,
  name: "User 4",
  handle: "user4",
};

const user5: UserType = {
  id: "5",
  pfp_url: avatar,
  name: "User 5",
  handle: "user5",
};

// example Messages
const sampleMessage1: MessageType = {
  id: nanoid(),
  sender: user1,
  content: "lorem ipsum? yeah right lmao, no lorem ipsum here bro 🤪",
  createdAt: new Date(),
};

const sampleMessage2: MessageType = {
  id: nanoid(),
  sender: user2,
  content: "yet another sample message",
  createdAt: new Date(),
};

const sampleMessage3: MessageType = {
  id: nanoid(),
  sender: user2,
  content: "here we have yet another sample message",
  createdAt: new Date(),
};

// example chats
export const sampleChat1: GroupType = {
  id: "1",
  type: "group",
  group_pfp_url: creeper,
  createdAt: new Date(),
  createdBy: user,
  isPublic: true,
  name: "Pessoal 2.0",
  description:
    "A very cool group! Memes, codeforces and competitive programming shenaningans, Minecraft, Bedwars, Synctube, and more!",
  inviteCode: nanoid(),
  latest: new Date(),
  // unread: 1,
  messages: [sampleMessage1],
  inputBuffer: "",
  members: [user, user1, user2, user3, user4, user5],
};

const sampleChat2: DMType = {
  id: "2",
  type: "dm",
  contact: user2,
  latest: new Date(),
  // unread: 2,
  messages: [sampleMessage2, sampleMessage3],
  inputBuffer: "",
};

interface State {
  chats: (GroupType | DMType)[];
  currentChatId: string | null;
  getCurrentChat: () => GroupType | DMType;
  getChatById: (chatId: string) => GroupType | DMType | null;
  createNewDM: (data: ChatSchemaType) => void;
  createNewGroup: (data: ChatSchemaType) => void;
  removeGroup: (chatId: string) => void;
  setCurrentChatId: (chatId: string) => void;
  closeChat: () => void;
  setInputBuffer: (chatId: string, newInput: string) => void;
  resetInviteCode: (chatId: string) => string;
  updateGroupSettings: (
    chatId: string,
    name: string,
    description: string,
    isPublic: boolean
  ) => void;
  fetchMessages: (chat: string) => MessageType[];
  addMessage: (chatId: string, data: messageSchemaType) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  clearUnread: (chatId?: string) => void;
}

export const useChatsStore = create<State>()(
  devtools(
    (set, get) => ({
      // chats: [sampleChat1, sampleChat2],
      chats: [],

      currentChatId: null,

      closeChat: () => {
        set((state) => ({ ...state, currentChatId: null }));
      },

      setCurrentChatId: (chatId) => {
        set((state) => ({ ...state, currentChatId: chatId }));
      },

      createNewDM: (data) => {
        if (get().chats.findIndex((chat) => chat.id === data.id) !== -1) return;

        // Find contact in list members (only has two entries)
        const contactData = (data.members as UserSchemaType[]).find(
          (m) => m.id !== user.id
        ) as UserSchemaType;

        const contact = { ...contactData, pfp_url: avatar };

        const newDM: DMType = {
          id: data.id,
          latest: data.latest,
          messages: [],
          inputBuffer: "",
          type: "dm",
          contact: contact,
        };

        set((state) => ({
          ...state,
          chats: [...get().chats, newDM],
        }));
      },

      // Creates a new group chat
      createNewGroup: (data) => {
        if (get().chats.findIndex((chat) => chat.id === data.id) !== -1) return;
        if (data.creator === null) throw new Error("Creator can't be null!");

        const newGroup: GroupType = {
          id: data.id,
          latest: data.latest,
          messages: [],
          inputBuffer: "",
          type: "group",
          name: data.name as string,
          description: data.description as string,
          group_pfp_url: creeper,
          isPublic: data.isPublic,
          inviteCode: data.inviteCode as string,
          members: data.members.map((member) => ({
            ...member,
            pfp_url: avatar,
          })),
          createdBy: { ...data.creator, pfp_url: avatar },
          createdAt: data.createdAt,
        };

        set((state) => ({
          ...state,
          chats: [...get().chats, newGroup],
        }));
      },

      removeGroup: (chatId) => {
        set((state) => ({
          ...state,
          currentChatId: null,
          chats: get().chats.filter((chat) => chat.id !== chatId),
        }));
      },

      getCurrentChat: () => {
        const chats = get().chats;
        const currentChatId = get().currentChatId;
        return chats.find((c) => c.id === currentChatId) as GroupType | DMType;
      },

      getChatById: (chatId) => {
        const chats = get().chats;
        const chat = chats.find((chat) => chat.id === chatId);
        if (chat === undefined) return null;
        return chat;
      },

      setInputBuffer: (chatId, newInput) => {
        set((state) => {
          return {
            ...state,
            chats: get().chats.map((chat) => ({
              ...chat,
              inputBuffer: chat.id === chatId ? newInput : chat.inputBuffer,
            })),
          };
        });
      },

      resetInviteCode: (chatId) => {
        const newInviteCode = nanoid();
        // first check if this chat is a group
        const chat = get().getChatById(chatId);
        if (chat === null) throw new Error("Chat not found");
        if (chat.type !== "group")
          throw new Error("You can't call this function on a DM chat!");

        // update chats immutably
        set((state) => ({
          ...state,
          chats: get().chats.map((chat) =>
            chat.id === chatId && chat.type === "group"
              ? { ...chat, inviteCode: newInviteCode }
              : chat
          ),
        }));
        return newInviteCode;
      },

      updateGroupSettings: (chatId, name, description, isPublic) => {
        // get chat by ID, perform sanity checks
        const chat = get().getChatById(chatId);
        if (chat === null) throw new Error("Chat not found");
        if (chat.type !== "group") {
          throw new Error("You can't call this function on a DM chat!");
        }

        // immutably update group
        const updatedGroup = {
          ...chat,
          name: name,
          description: description,
          isPublic: isPublic,
        };

        // update chats immutably
        set((state) => ({
          ...state,
          chats: get().chats.map((chat) =>
            chat.id === chatId ? updatedGroup : chat
          ),
        }));
      },

      // Fetch all messages for a specific chat

      fetchMessages: (chatId) => {
        const chats = get().chats;
        const targetChat = chats.find((c) => c.id === chatId) as ChatType;
        return targetChat.messages;
      },

      // Creates a new message and adds it to the chat with the specified ID
      addMessage: (chatId, data) => {
        // if (get().chats.findIndex((chat) => chat.id === data.id) !== -1) return;

        const newMsg: MessageType = {
          id: data.id,
          sender: { ...data.author, pfp_url: avatar },
          content: data.content,
          createdAt: data.createdAt,
        };

        set((state) => {
          return {
            chats: get().chats.map((chat) => {
              // does target chat Id match with this chat's id?
              if (chat.id === chatId) {
                // Search messages for matching ID before adding new message
                if (chat.messages.findIndex((m) => m.id === newMsg.id) !== -1) {
                  return chat;
                }

                // returning immutable state
                return {
                  ...chat,
                  latest: new Date(),
                  messages: [...chat.messages, newMsg],
                };
              } else {
                return chat;
              }
            }),
          };
        });
      },

      deleteMessage: (chatId, messageId) => {
        set((state) => {
          // console.log('did we even get this far?');
          const chats = get().chats;
          const targetChatIndex = chats.findIndex((c) => c.id === chatId);
          const targetChat = chats[targetChatIndex];
          const filteredMessages = targetChat.messages.filter(
            (m) => m.id !== messageId
          );

          return {
            ...state,
            chats: [
              ...chats.slice(0, targetChatIndex),
              { ...targetChat, messages: filteredMessages },
              ...chats.slice(targetChatIndex + 1),
            ],
          };
        });
      },

      clearUnread: (chatId) => {
        set((state) => ({
          ...state,
          chats: get().chats.map((chat) =>
            chat.id === get().currentChatId ? { ...chat, unread: 0 } : chat
          ),
        }));
      },
    }),
    {
      name: "chats-storage",
    }
  )
);
