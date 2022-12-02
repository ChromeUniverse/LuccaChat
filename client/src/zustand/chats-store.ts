import create from "zustand";
import avatar from "../assets/avatar.jpeg";
import creeper from "../assets/creeper.webp";
import { devtools } from "zustand/middleware";
import { nanoid } from "nanoid";
import { ChatType, DMType, GroupType, MessageType } from "../data";
import {
  ChatSchemaType,
  UserSchemaType,
} from "../../../server/src/zod/api-chats";
import { messageSchemaType } from "../../../server/src/zod/api-messages";
import { useUserStore } from "./user-store";

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
  setInviteCode: (groupId: string, inviteCode: string) => void;
  updateGroupSettings: (
    groupId: string,
    name: string,
    description: string,
    isPublic: boolean
  ) => void;
  fetchMessages: (chat: string) => MessageType[];
  addMessage: (chatId: string, data: messageSchemaType) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  updateLatest: (chatId: string, newLatest: Date) => void;
  chatHasUser: (chatId: string, userId: string) => boolean;
  updateUserInfoInChats: (userId: string, handle: string, name: string) => void;
  resetLastUserImageUpdate: (userId: string) => void;
  resetLastGroupImageUpdate: (groupId: string) => void;
  removeMemberFromGroup: (groupId: string, memberId: string) => void;
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
        const user = useUserStore.getState().user;

        // Find contact in list members (only has two entries)
        const contactData = (data.members as UserSchemaType[]).find(
          (m) => m.id !== user.id
        ) as UserSchemaType;

        const newDM: DMType = {
          id: data.id,
          latest: data.latest,
          messages: [],
          inputBuffer: "",
          type: "dm",
          contact: contactData,
          lastImageUpdate: new Date(),
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

        console.log("New data", data);

        const newGroup: GroupType = {
          id: data.id,
          latest: data.latest,
          messages: [],
          inputBuffer: "",
          type: "group",
          name: data.name as string,
          description: data.description as string,
          isPublic: data.isPublic as boolean,
          inviteCode: data.inviteCode as string,
          members: data.members,
          createdBy: data.creator,
          createdAt: data.createdAt,
          lastImageUpdate: new Date(),
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
        const targetChat = chats.find((c) => c.id === currentChatId);
        if (!targetChat)
          throw new Error(
            `target chat not found! Tried chat ID ${currentChatId}`
          );

        return targetChat as GroupType | DMType;
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

      setInviteCode: (groupId, inviteCode) => {
        // first check if this chat is a group
        const chat = get().getChatById(groupId);
        if (chat === null) throw new Error("Chat not found");
        if (chat.type !== "group")
          throw new Error("You can't call this function on a DM chat!");

        // update chats immutably
        set((state) => ({
          ...state,
          chats: get().chats.map((chat) =>
            chat.id === groupId && chat.type === "group"
              ? { ...chat, inviteCode: inviteCode }
              : chat
          ),
        }));
      },

      updateGroupSettings: (groupId, name, description, isPublic) => {
        // get chat by ID, perform sanity checks
        const chat = get().getChatById(groupId);
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
            chat.id === groupId ? updatedGroup : chat
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
        if (get().chats.findIndex((chat) => chat.id === data.id) !== -1) return;

        const newMsg: MessageType = {
          id: data.id,
          sender: data.author,
          content: data.content,
          createdAt: data.createdAt,
          lastImageUpdate: new Date(),
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

      updateLatest: (chatId, newLatest) => {
        // update chats immutably
        set((state) => ({
          ...state,
          chats: get().chats.map((chat) =>
            chat.id === chatId ? { ...chat, latest: newLatest } : chat
          ),
        }));
      },

      chatHasUser: (chatId, userId) => {
        const chat = get().getChatById(chatId);
        if (!chat) throw new Error("Chat not found");

        if (chat.type === "dm") return true;
        if (chat.type === "group") {
          for (const member of chat.members) {
            if (member.id === userId) return true;
          }
          return false;
        }
        return false;
      },

      updateUserInfoInChats: (userId, name, handle) => {
        const chatHasUser = get().chatHasUser;
        const newChats = get().chats.map((chat) => {
          const hasUser = chatHasUser(chat.id, userId);

          console.log(
            `Chat ID ${chat.id}, type ${chat.type},  does ${
              hasUser ? "" : "not"
            } have user ID ${userId}`
          );

          if (hasUser) {
            const newChat = {
              ...chat,
              messages: chat.messages.map((message) => ({
                ...message,
                sender:
                  message.sender.id === userId
                    ? {
                        ...message.sender,
                        handle: handle,
                        name: name,
                      }
                    : message.sender,
              })),
            };

            if (newChat.type === "dm") {
              return {
                ...newChat,
                contact:
                  newChat.contact.id === userId
                    ? { ...newChat.contact, name: name, handle: handle }
                    : newChat.contact,
              };
            } else {
              return {
                ...newChat,
                members: newChat.members.map((m) =>
                  m.id === userId ? { ...m, name: name, handle: handle } : m
                ),
                createdBy:
                  newChat.createdBy.id === userId
                    ? { ...newChat.createdBy, name: name, handle: handle }
                    : newChat.createdBy,
              };
            }
          } else {
            return chat;
          }
        });
        set((state) => ({ chats: newChats }));
      },

      removeMemberFromGroup: (groupId, memberId) => {
        set((state) => ({
          ...state,
          chats: get().chats.map((chat) =>
            chat.type === "group" && chat.id === groupId
              ? {
                  ...chat,
                  members: chat.members.filter((m) => m.id !== memberId),
                }
              : chat
          ),
        }));
      },

      resetLastUserImageUpdate: (userId) => {
        const chatHasUser = get().chatHasUser;
        const newChats = get().chats.map((chat) => {
          const hasUser = chatHasUser(chat.id, userId);

          console.log(
            `Chat ID ${chat.id}, type ${chat.type},  does ${
              hasUser ? "" : "not"
            } have user ID ${userId}`
          );

          if (hasUser) {
            return {
              ...chat,
              lastImageUpdate: new Date(),
              messages: chat.messages.map((message) => ({
                ...message,
                lastImageUpdate:
                  message.sender.id === userId
                    ? new Date()
                    : message.lastImageUpdate,
              })),
            };
          } else {
            return chat;
          }
        });
        set((state) => ({ chats: newChats }));
      },

      resetLastGroupImageUpdate: (groupId) => {
        set((state) => ({
          ...state,
          chats: get().chats.map((chat) =>
            chat.type === "group"
              ? { ...chat, lastImageUpdate: new Date() }
              : chat
          ),
        }));
      },
    }),
    {
      name: "chats-storage",
    }
  )
);
