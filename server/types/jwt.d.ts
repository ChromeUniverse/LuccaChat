export type UserJwtToSend = {
  id: string;
};

export type UserJwtReceived = {
  id: string;
  iat: number; // NOTE: number of *seconds* passed since Unix epoch
};
