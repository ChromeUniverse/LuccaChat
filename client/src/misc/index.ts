// Sources for Date reviver function:
// https://mariusschulz.com/blog/deserializing-json-strings-as-javascript-date-objects (incorrect time format)
// https://stackoverflow.com/a/1793474 (correct time format)
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

import { DMType, GroupType } from "../data";

const dateFormat =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(Z|([+\-])(\d{2}):(\d{2}))$/;

function reviver(key: any, value: any) {
  if (typeof value === "string" && dateFormat.test(value)) {
    return new Date(value);
  }
  return value;
}

export function JsonSuperParse(stringifiedJSON: string) {
  return JSON.parse(stringifiedJSON, reviver);
}

export const copyInviteLinkToClipboard = async (chat: GroupType) => {
  const inviteLink = `${import.meta.env.VITE_REACT_APP_URL}/invite/${
    chat.inviteCode
  }`;
  console.log(inviteLink);
  await navigator.clipboard.writeText(inviteLink);
  console.log("copied!");
};

export const copyMsgContentToClipboard = async (content: string) => {
  await navigator.clipboard.writeText(content);
  console.log("copied!");
};

// helper function
export function formatDate(date: Date) {
  return date.toLocaleDateString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
