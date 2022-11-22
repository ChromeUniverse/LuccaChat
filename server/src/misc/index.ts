import { WebSocket } from "ws";

export function getWSfromUserId(
  wsUserMap: Map<WebSocket, string>,
  targerUserId: string
) {
  for (const ws of wsUserMap.keys()) {
    if (wsUserMap.get(ws) === targerUserId) return ws;
  }
  return null;
}
