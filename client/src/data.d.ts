export interface UserType {
  id: string;
  pfp_url: string;
  name: string;
  handle: string;
}

export interface CurrentUserType extends UserType {}

export interface MessageType {
  id: string;
  sender: UserType;
  content: string;
  createdAt: Date;
}

export interface ChatType {
  id: string;
  latest: Date;
  messages: MessageType[];
  inputBuffer: string;
}

export interface GroupType extends ChatType {
  type: "group";
  group_pfp_url: string;
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
}
