import axios, { AxiosError } from "axios";
import { currentUserSchema, userSchema } from "../../../server/src/zod/user";

export default async function fetchCurrentUser() {
  try {
    // GET request
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/user`;
    const { data, status } = await axios.get(url, { withCredentials: true });
    return { data: currentUserSchema.parse(data), status };
  } catch (err) {
    const error = err as AxiosError;
    console.error(err);
    return { data: null, status: error.status || -1 };
  }
}
