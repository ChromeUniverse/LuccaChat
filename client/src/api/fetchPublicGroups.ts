import axios, { AxiosError } from "axios";
import { chatsSchema } from "../../../server/src/zod/api-chats";
import { JsonSuperParse } from "../misc";

export default async function fetchPublicGroups() {
  try {
    // format url
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/public-groups/`;

    // GET request
    const { data, status } = await axios.get(url, {
      withCredentials: true,
      transformResponse: (res) => JsonSuperParse(res),
    });

    // validate with Zod
    return { data: chatsSchema.parse(data), status };
  } catch (err) {
    const error = err as AxiosError;
    console.error(err);
    return { data: null, status: error.status || -1 };
  }
}
