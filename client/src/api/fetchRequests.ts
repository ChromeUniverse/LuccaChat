import axios, { AxiosError } from "axios";
import {
  requestArraySchema,
  requestArraySchemaPrimitive,
  requestSchema,
} from "../../../server/src/zod/api-requests";
import { JsonSuperParse } from "../misc";

export default async function fetchRequests() {
  try {
    // GET request
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/requests`;
    const { data, status } = await axios.get(url, {
      withCredentials: true,
      transformResponse: (res) => JsonSuperParse(res),
    });
    return { data: requestArraySchema.parse(data), status };
  } catch (err) {
    const error = err as AxiosError;
    console.error(err);
    return { data: null, status: error.status || -1 };
  }
}
