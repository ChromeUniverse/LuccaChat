import axios, { AxiosError } from "axios";
import {
  chatSchema,
  chatsSchema,
  chatsSchemaPrimitive,
} from "../../../server/src/zod/api-chats";
import { JsonSuperParse } from "../misc";

export default async function fetchChats() {
  try {
    // GET request
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/chats`;
    const { data, status } = await axios.get(url, {
      withCredentials: true,
      transformResponse: (res) => JsonSuperParse(res),
    });

    return { data: chatsSchema.parse(data), status: status };
  } catch (err) {
    const error = err as AxiosError;
    console.error(err);
    return { data: null, status: error.status || -1 };
  }
}
