import axios from "axios";
import {
  chatSchema,
  chatsSchema,
  chatsSchemaPrimitive,
} from "../../../server/src/zod/api-chats";

export default async function fetchChats() {
  // GET request
  const url = `${import.meta.env.VITE_BACKEND_URL}/api/chats`;
  const { data, status } = await axios.get(url, { withCredentials: true });

  // Validate primitive chat data
  const validatedPrimitiveChatsData = chatsSchemaPrimitive.parse(data);

  // Validate and convert Date types
  const validatedChatsData = validatedPrimitiveChatsData.map(
    (primitiveChatData) => {
      const chatData = {
        ...primitiveChatData,
        latest: new Date(primitiveChatData.latest),
        createdAt: new Date(primitiveChatData.createdAt),
      };
      return chatSchema.parse(chatData);
    }
  );
  return chatsSchema.parse(validatedChatsData);
}
