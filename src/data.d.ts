export interface UserType {
  id: string;
  pfp_url: string;
  name: string;
  handle: string;
}

export interface CurrentUserType extends UserType {
  email: string;
}

export interface MessageType {
  id: string;
  sender: UserType;
  content: string;
  createdAt: Date;
}

export interface ChatType {
  id: string;
  unread: number;
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
