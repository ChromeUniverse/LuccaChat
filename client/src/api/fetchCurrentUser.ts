import axios from "axios";
import { currentUserSchema } from "../../../server/src/zod/schemas";

export default async function fetchCurrentUser() {
  // GET request
  const url = `${import.meta.env.VITE_BACKEND_URL}/api/user`;
  const { data, status } = await axios.get(url);
  return currentUserSchema.parse(data);
}
