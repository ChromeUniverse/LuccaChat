import axios, { AxiosError } from "axios";
import { chatSchema } from "../../../server/src/zod/api-chats";
import { JsonSuperParse } from "../misc";

export default async function fetchGroupByInvite(inviteCode: string) {
  try {
    // GET request
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/invite/${inviteCode}`;
    const { data, status } = await axios.get(url, {
      withCredentials: true,
      transformResponse: (res) => JsonSuperParse(res),
    });
    return { data: chatSchema.parse(data), status };
  } catch (err) {
    const error = err as AxiosError;
    console.error(err);
    return { data: null, status: error.status || -1 };
  }
}
