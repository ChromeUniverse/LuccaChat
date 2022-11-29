import { WebSocket } from "ws";
import path from "path";
import fs from "fs";
import axios from "axios";

export function getWSfromUserId(
  wsUserMap: Map<WebSocket, string>,
  targerUserId: string
) {
  for (const ws of wsUserMap.keys()) {
    if (wsUserMap.get(ws) === targerUserId) return ws;
  }
  return null;
}

export async function downloadPFP(userId: string, imageURL: string) {
  const pathToImage = path.join(
    __dirname,
    "..",
    "..",
    "avatars",
    `${userId}.jpeg`
  );
  console.log(pathToImage);

  const writer = fs.createWriteStream(pathToImage);

  const response = await axios({
    url: imageURL,
    method: "GET",
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
