export type UserJwtToSend = {
  id: string;
};

export type UserJwtReceived = {
  id: string;
  iat: number; // NOTE: number of *seconds* passed since Unix epoch
};

export type WsAuthJwtToSend = {
  id: string;
};

export type WsAuthJwtReceived = {
  id: string;
  iat: number; // NOTE: number of *seconds* passed since Unix epoch
};
