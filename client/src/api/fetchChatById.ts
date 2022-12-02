import axios, { AxiosError } from "axios";
import { chatSchema, chatsSchema } from "../../../server/src/zod/api-chats";
import { JsonSuperParse } from "../misc";

export default async function fetchChatById(chatId: string) {
  try {
    // format url
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/chats/${chatId}`;

    // GET request
    const { data, status } = await axios.get(url, {
      withCredentials: true,
      transformResponse: (res) => JsonSuperParse(res),
    });

    console.log("Axios returned:", data);

    // validate with Zod
    return { data: chatSchema.parse(data), status };
  } catch (err) {
    const error = err as AxiosError;
    console.error(err);
    return { data: null, status: error.status || -1 };
  }
}
