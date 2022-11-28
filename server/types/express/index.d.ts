declare namespace Express {
  export interface Request {
    currentUser: import("../jwt").UserJwtReceived;
    // currentUser: string;
  }
}
