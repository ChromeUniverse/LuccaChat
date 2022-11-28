import axios from "axios";
import {
  requestArraySchema,
  requestArraySchemaPrimitive,
  requestSchema,
} from "../../../server/src/zod/api-requests";

export default async function fetchRequests() {
  // GET request
  const url = `${import.meta.env.VITE_BACKEND_URL}/api/requests`;
  const { data, status } = await axios.get(url, { withCredentials: true });

  // Validate primitive chat data
  const requestArrayPrimitive = requestArraySchemaPrimitive.parse(data);

  // Validate and convert Date types
  const validatedReqs = requestArrayPrimitive.map((primitiveReq) => {
    const msgData = {
      ...primitiveReq,
      createdAt: new Date(primitiveReq.createdAt),
    };
    return requestSchema.parse(msgData);
  });
  return requestArraySchema.parse(validatedReqs);
}
