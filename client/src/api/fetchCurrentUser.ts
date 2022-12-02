import axios, { AxiosError } from "axios";
import { userSchema } from "../../../server/src/zod/api-chats";

export default async function fetchCurrentUser() {
  try {
    // GET request
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/user`;
    const { data, status } = await axios.get(url, { withCredentials: true });
    return userSchema.parse(data);
  } catch (err) {
    const error = err as AxiosError;
    console.error(err);
    return { id: null, name: null, handle: null };
  }
}
