export type colorType = "blue" | "pink" | "green" | "orange" | "violet";

export interface UserType {
  id: string;
  name: string;
  handle: string;
  accentColor: colorType;
}

export interface CurrentUserType extends UserType {}

export interface MessageType {
  id: string;
  sender: UserType;
  content: string;
  createdAt: Date;
  lastImageUpdate: Date;
}

export interface ChatType {
  id: string;
  latest: Date;
  messages: MessageType[];
  inputBuffer: string;
  lastImageUpdate: Date;
}

export interface GroupType extends ChatType {
  type: "group";
  inviteCode: string;
  name: string;
  isPublic: boolean;
  description: string;
  members: UserType[];
  createdBy: UserType;
  createdAt: Date;
}

export interface DMType extends ChatType {
  type: "dm";
  contact: UserType;
}

export interface RequestType {
  id: string;
  sender: UserType;
  sentAt: Date;
  lastImageUpdate: Date;
}
