// declare namespace WebSocket {
//   export interface WebSocket {
//     // currentUser: import("../jwt").UserJwtReceived;
//     lmao: string;
//   }
// }

import ws from "ws";

declare module "ws" {
  export interface WebSocket extends ws {
    userId?: string;
  }
}
