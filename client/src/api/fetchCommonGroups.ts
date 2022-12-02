import axios, { AxiosError } from "axios";
import { chatsSchema } from "../../../server/src/zod/api-chats";
import { JsonSuperParse } from "../misc";

export default async function fetchCommonGroups(otherUserId: string) {
  try {
    // format url
    const url = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/common-groups/${otherUserId}`;

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
