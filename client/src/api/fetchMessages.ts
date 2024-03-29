import axios, { AxiosError } from "axios";
import {
  messageSchema,
  messagesSchema,
  messagesSchemaPrimitive,
} from "../../../server/src/zod/api-messages";
import { JsonSuperParse } from "../misc";

export default async function fetchMessages(chatId: string) {
  try {
    // GET request
    const url = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/chats/${chatId}/messages`;

    const { data, status } = await axios.get(url, {
      withCredentials: true,
      transformResponse: (res) => JsonSuperParse(res),
    });

    return { data: messagesSchema.parse(data), status };
  } catch (err) {
    const error = err as AxiosError;
    console.error(err);
    return { data: null, status: error.status || -1 };
  }
}
