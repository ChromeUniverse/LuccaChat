import axios from "axios";
import {
  messageSchema,
  messagesSchema,
  messagesSchemaPrimitive,
} from "../../../server/src/zod/api-messages";

export default async function fetchMessages(chatId: string) {
  // GET request
  const url = `${
    import.meta.env.VITE_BACKEND_URL
  }/api/chats/${chatId}/messages`;

  const { data, status } = await axios.get(url, { withCredentials: true });

  // Validate primitive chat data
  const messagesPrimitive = messagesSchemaPrimitive.parse(data);

  // Validate and convert Date types
  const validatedMessages = messagesPrimitive.map((primitiveMsg) => {
    const msgData = {
      ...primitiveMsg,
      createdAt: new Date(primitiveMsg.createdAt),
    };
    return messageSchema.parse(msgData);
  });
  return messagesSchema.parse(validatedMessages);
}
