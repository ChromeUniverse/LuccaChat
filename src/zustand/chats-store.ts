import create from "zustand";
import avatar from '../assets/avatar.jpeg'
import { devtools } from "zustand/middleware";
import { nanoid } from "nanoid";
import { ChatType, DMType, GroupType, MessageType, UserType } from "../data";



// example Users

// authed user:
const user: UserType = {
  id: '0',
  pfp_url: avatar,
  name: 'Lucca Rodrigues',
  handle: 'lucca'
}

const user1: UserType = {
  id: '1',
  pfp_url: avatar,
  name: 'User 1',
  handle: 'user1'
}

const user2: UserType = {
  id: '2',
  pfp_url: avatar,
  name: 'User 2',
  handle: 'user2'
}

const user3: UserType = {
  id: '3',
  pfp_url: avatar,
  name: 'User 3',
  handle: 'user3'
}

const user4: UserType = {
  id: '4',
  pfp_url: avatar,
  name: 'User 4',
  handle: 'user4'
}

const user5: UserType = {
  id: '5',
  pfp_url: avatar,
  name: 'User 5',
  handle: 'user5'
}

// example Messages
const sampleMessage1: MessageType = {
  id: nanoid(),
  sender: user1,
  content: "lorep ipsum? more like deez nuts lmao",
};

const sampleMessage2: MessageType= {
  id: nanoid(),
  sender: user2,
  content: "yet another sample message",
};

const sampleMessage3: MessageType= {
  id: nanoid(),
  sender: user2,
  content: "here we have yet another sample message",
};

// example chats
const sampleChat1: GroupType = {
  id: '1',
  type: "group",
  name: "Pessoal 2.0",
  description: "A very cool group",
  messages: [sampleMessage1],
  inputBuffer: '',
  members: [user1, user2, user3, user4, user5]
};


const sampleChat2: DMType = {
  id: '2',
  type: "dm",
  contact: user2,
  messages: [sampleMessage2, sampleMessage3],
  inputBuffer: ''
};



interface State {
  chats: (GroupType | DMType)[];
  currentChatId: string;
  setCurrentChatId: (chatId: string) => void;
  setInputBuffer: (chatId: string, newInput: string) => void;
  fetchMessages: (chat: string) => MessageType[];
  addMessage: (chatId: string, messageContent: string) => void;
  removeMessage: (chatId: string, messageId: string) => void;
}

export const useChatsStore = create<State>()(
  devtools(
    (set, get) => ({
      chats: [sampleChat1, sampleChat2],

      currentChatId: '1',

      setCurrentChatId: (chatId) => set((state) => ({ ...state, currentChatId: chatId })),
      
      setInputBuffer: (chatId, newInput) => {

        set((state) => {
          // console.log('did we even get this far?');        
          const chats = get().chats;
          const targetChatIndex = chats.findIndex((c) => c.id === chatId);
          const targetChat= chats[targetChatIndex];
          console.log(targetChat);
          
          return {
            ...state,
            chats: [
              ...chats.slice(0, targetChatIndex),
              { ...targetChat, inputBuffer: newInput },
              ...chats.slice(targetChatIndex + 1),
            ],
          };
        });
      },

      // Fetch all messages for a specific chat

      fetchMessages: (chatId) => {
        const chats = get().chats;
        const targetChat = chats.find(c => c.id === chatId) as ChatType;
        return targetChat.messages;
      },

      // Creates a new message and adds it to the chat with the specified ID
      addMessage: (chatId, messageContent) => {
        const newMsg: MessageType= {
          id: nanoid(),
          sender: user,
          content: messageContent,
        };

        set((state) => {
          // console.log('did we even get this far?');        
          const chats = get().chats;
          const targetChatIndex = chats.findIndex((c) => c.id === chatId);
          const targetChat= chats[targetChatIndex];
          console.log(targetChat);
          
          return {
            ...state,
            chats: [
              ...chats.slice(0, targetChatIndex),
              { ...targetChat, messages: [...targetChat.messages, newMsg] },
              ...chats.slice(targetChatIndex + 1),
            ],
          };
        });
      },


      removeMessage: (chatId: string, messageId: string) => {
        set((state) => ({ ...state, chats: [...get().chats] }));
      },
    }),
    {
      name: "chats-storage",
    }
  )
);